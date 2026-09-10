-- ==============================================================================
-- UXI HQ - Migration 013: Fix Auth Profile <-> RLS Admin Mapping for Verified Founder
-- Idempotently maps verified founder auth.users UUID to public.profiles with Admin role
-- ==============================================================================

BEGIN;

-- 1. Safely upsert verified founder profile matching exact auth.users UUID
DO $$
DECLARE
    v_founder_auth_id UUID;
    v_founder_email TEXT := 'ranjithkumartirumalasetti@gmail.com';
    v_profile_exists BOOLEAN;
    v_role_assigned public.user_role;
BEGIN
    -- Locate exact founder in auth.users
    SELECT id INTO v_founder_auth_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(v_founder_email)
    LIMIT 1;

    IF v_founder_auth_id IS NULL THEN
        RAISE EXCEPTION 'AUTH USER MISMATCH: Verified founder account % was not found in auth.users!', v_founder_email;
    END IF;

    -- Upsert public.profiles row for the verified founder Auth UUID
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        created_at,
        updated_at
    )
    VALUES (
        v_founder_auth_id,
        'Ranjith Kumar',
        v_founder_email,
        'Admin'::public.user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'Admin'::public.user_role,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        email = v_founder_email,
        updated_at = NOW();

    -- Synchronize team_members record with the founder Auth UUID
    UPDATE public.team_members
    SET user_id = v_founder_auth_id,
        role = 'Admin'::public.user_role
    WHERE LOWER(email) = LOWER(v_founder_email);

    -- Ensure SELECT policy on public.profiles is fully permissive for authenticated users
    -- (Essential for RLS subqueries like EXISTS(SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()))
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'profiles' 
          AND policyname = 'Allow authenticated read on profiles'
    ) THEN
        CREATE POLICY "Allow authenticated read on profiles" 
            ON public.profiles FOR SELECT 
            TO authenticated 
            USING (true);
    END IF;

    RAISE NOTICE 'SUCCESS: Founder % (Auth ID: %) verified and mapped to Admin profile.', v_founder_email, v_founder_auth_id;
END $$;

COMMIT;

-- 2. Diagnostic Query (Shows Auth User and Profile mapping without sensitive data)
SELECT 
    u.id AS auth_user_id,
    u.email AS auth_email,
    (u.email_confirmed_at IS NOT NULL) AS is_email_confirmed,
    p.id AS profile_id,
    p.role AS profile_role,
    p.full_name AS profile_full_name,
    (p.id = u.id AND p.role IN ('Admin', 'Manager')) AS is_admin_condition_satisfied
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'ranjithkumartirumalasetti@gmail.com';
