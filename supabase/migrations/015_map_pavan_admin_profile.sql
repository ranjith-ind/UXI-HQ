-- ==============================================================================
-- UXI HQ - Migration 015: Authorize and Map Pavan Account to Admin Role
-- Target UUID: 416a0aba-290e-486e-80ab-c555d2b32392
-- Target Email: pavanmanepalli521@gmail.com
-- Preserves founder account: ranjithkumartirumalasetti@gmail.com
-- Strictly preserves existing RLS policies and table permissions
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Verify existence of auth.users record
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_target_auth_id UUID := '416a0aba-290e-486e-80ab-c555d2b32392'::uuid;
    v_target_email TEXT := 'pavanmanepalli521@gmail.com';
    v_auth_exists BOOLEAN;
    v_next_emp_code TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = v_target_auth_id
    ) INTO v_auth_exists;

    IF NOT v_auth_exists THEN
        RAISE EXCEPTION 'CRITICAL: Auth user with ID % does not exist in auth.users!', v_target_auth_id;
    END IF;

    -- --------------------------------------------------------------------------
    -- 2. Upsert profile record with role = 'Admin'
    -- --------------------------------------------------------------------------
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        created_at,
        updated_at
    )
    VALUES (
        v_target_auth_id,
        'Pavan Manepalli',
        v_target_email,
        'Admin'::public.user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'Admin'::public.user_role,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name, 'Pavan Manepalli'),
        email = v_target_email,
        updated_at = NOW();

    -- --------------------------------------------------------------------------
    -- 3. Synchronize team_members record
    -- --------------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE user_id = v_target_auth_id OR LOWER(email) = LOWER(v_target_email)
    ) THEN
        UPDATE public.team_members
        SET user_id = v_target_auth_id,
            role = 'Admin'::public.user_role,
            full_name = COALESCE(full_name, 'Pavan Manepalli'),
            name = COALESCE(name, 'Pavan Manepalli'),
            member_status = 'Active'
        WHERE user_id = v_target_auth_id OR LOWER(email) = LOWER(v_target_email);
    ELSE
        -- Compute next sequential employee code
        SELECT 'UXI-EMP-' || LPAD((COALESCE(MAX(NULLIF(regexp_replace(employee_code, '\D', '', 'g'), '')::int), 4) + 1)::text, 3, '0')
        INTO v_next_emp_code
        FROM public.team_members;

        IF v_next_emp_code IS NULL THEN
            v_next_emp_code := 'UXI-EMP-005';
        END IF;

        INSERT INTO public.team_members (
            user_id,
            employee_code,
            name,
            full_name,
            email,
            role,
            title,
            designation,
            department,
            member_status,
            joined_date,
            is_founder,
            created_at,
            updated_at
        )
        VALUES (
            v_target_auth_id,
            v_next_emp_code,
            'Pavan Manepalli',
            'Pavan Manepalli',
            v_target_email,
            'Admin'::public.user_role,
            'System Administrator',
            'System Administrator',
            'Executive & Engineering',
            'Active',
            CURRENT_DATE,
            FALSE,
            NOW(),
            NOW()
        );
    END IF;

    RAISE NOTICE 'SUCCESS: User % (ID: %) mapped to Admin profile and team member.', v_target_email, v_target_auth_id;
END $$;

COMMIT;

-- ------------------------------------------------------------------------------
-- 4. Post-Execution Verification: Both Accounts Status
-- ------------------------------------------------------------------------------
SELECT 
    'PAVAN (CURRENT ADMIN)' AS account_label,
    p.id AS profile_id,
    p.email AS profile_email,
    p.full_name AS profile_name,
    p.role AS profile_role,
    (tm.id IS NOT NULL) AS team_member_synced,
    tm.role AS team_member_role
FROM public.profiles p
LEFT JOIN public.team_members tm ON tm.user_id = p.id
WHERE p.id = '416a0aba-290e-486e-80ab-c555d2b32392'

UNION ALL

SELECT 
    'RANJITH (FOUNDER ADMIN)' AS account_label,
    p.id AS profile_id,
    p.email AS profile_email,
    p.full_name AS profile_name,
    p.role AS profile_role,
    (tm.id IS NOT NULL) AS team_member_synced,
    tm.role AS team_member_role
FROM public.profiles p
LEFT JOIN public.team_members tm ON tm.user_id = p.id
WHERE p.id = '60abe450-2447-4e91-962d-c86abcb723fd';

-- ------------------------------------------------------------------------------
-- 5. Authenticated RBAC Simulation for Pavan's Context
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claims', '{"sub":"416a0aba-290e-486e-80ab-c555d2b32392","role":"authenticated"}', true);

    IF NOT public.is_authenticated_user() THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: is_authenticated_user() returned false for Pavan!';
    END IF;

    IF NOT public.is_admin_or_manager() THEN
        RAISE EXCEPTION 'VERIFICATION FAILED: is_admin_or_manager() returned false for Pavan!';
    END IF;

    RAISE NOTICE 'VERIFICATION PASSED: Pavan context evaluates to Admin (is_authenticated_user=true, is_admin_or_manager=true)';
END $$;
