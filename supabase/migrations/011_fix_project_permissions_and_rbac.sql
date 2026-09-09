-- ==============================================================================
-- UXI HQ - Migration 011: Minimal Safe Fix for Project Permissions & RBAC
-- Principle of Least Privilege: Only grants required tables, preserves RLS & RBAC
-- ==============================================================================

BEGIN;

-- 1. Minimal Schema & Table Grants
-- Allow authenticated users to access public schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Operational grants on projects (SELECT, INSERT, UPDATE, DELETE) to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;

-- Operational grants on project_members junction table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_members TO authenticated;

-- Read-only grants on profiles and clients (required for RLS role checks and FK validation)
-- Strictly NO write access granted on profiles or clients to prevent privilege escalation
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.clients TO authenticated;

-- 2. Restore/Upsert Authenticated Founder Profile
-- Maps authenticated user 60abe450-2447-4e91-962d-c86abcb723fd to Admin role
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    created_at,
    updated_at
)
VALUES (
    '60abe450-2447-4e91-962d-c86abcb723fd',
    'Ranjith Kumar',
    'ranjithkumartirumalasetti@gmail.com',
    'Admin'::public.user_role,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'Admin'::public.user_role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Associate founder profile with team_members record if present
UPDATE public.team_members
SET user_id = '60abe450-2447-4e91-962d-c86abcb723fd',
    role = 'Admin'::public.user_role
WHERE email IN ('ranjithkumartirumalasetti@gmail.com', 'ranjith@uxitech.in');

-- 3. Row Level Security (RLS) for public.projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Clean up any obsolete, conflicting, or broad policies
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and Managers can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated read on projects" ON public.projects;
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;

-- SELECT: Only authenticated users with an existing profile in public.profiles can view projects
CREATE POLICY "projects_select_policy"
ON public.projects FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
    )
);

-- INSERT: Strictly restricted to Admin and Manager roles verified via public.profiles
CREATE POLICY "projects_insert_policy"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
);

-- UPDATE: Strictly restricted to Admin and Manager roles verified via public.profiles
CREATE POLICY "projects_update_policy"
ON public.projects FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
);

-- DELETE: Strictly restricted to Admin and Manager roles verified via public.profiles
CREATE POLICY "projects_delete_policy"
ON public.projects FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
);

-- 4. Row Level Security (RLS) for public.project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Authenticated users can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Allow authenticated manage on project members" ON public.project_members;
DROP POLICY IF EXISTS "project_members_select_policy" ON public.project_members;
DROP POLICY IF EXISTS "project_members_manage_policy" ON public.project_members;

CREATE POLICY "project_members_select_policy"
ON public.project_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
    )
);

CREATE POLICY "project_members_manage_policy"
ON public.project_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('Admin', 'Manager')
    )
);

-- 5. Idempotent Production Verification for "Shivarudra Foundation"
-- Does NOT delete any existing projects or clients
-- Does NOT duplicate if Shivarudra Foundation already exists
DO $$
DECLARE
    v_client_id UUID;
    v_project_id UUID;
    v_founder_id UUID := '60abe450-2447-4e91-962d-c86abcb723fd';
BEGIN
    -- Check if Shivarudra Foundation client already exists
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE LOWER(company_name) = LOWER('Shivarudra Foundation')
       OR LOWER(full_name) = LOWER('Shivarudra Foundation')
    LIMIT 1;

    -- If not found, create single production client
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (
            id,
            full_name,
            company_name,
            email,
            client_status,
            source,
            notes,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Shivarudra Foundation',
            'Shivarudra Foundation',
            'contact@shivarudrafoundation.org',
            'Active',
            'Direct Contact',
            'Production organization client record for Shivarudra Foundation.',
            v_founder_id,
            NOW(),
            NOW()
        ) RETURNING id INTO v_client_id;
    END IF;

    -- Check if Shivarudra Foundation project already exists
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE LOWER(project_name) = LOWER('Shivarudra Foundation')
       OR project_code = 'UXI-2026-001'
    LIMIT 1;

    -- If not found, create single production project
    IF v_project_id IS NULL THEN
        INSERT INTO public.projects (
            id,
            client_id,
            project_name,
            project_code,
            project_type,
            description,
            project_status,
            priority,
            estimated_budget,
            final_budget,
            currency,
            advance_amount,
            total_paid_amount,
            pending_amount,
            start_date,
            estimated_deadline,
            is_archived,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_client_id,
            'Shivarudra Foundation',
            'UXI-2026-001',
            'Web Application',
            'Official digital presence and platform for Shivarudra Foundation.',
            'Confirmed',
            'High',
            250000.00,
            250000.00,
            'INR',
            100000.00,
            100000.00,
            150000.00,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '60 days',
            false,
            v_founder_id,
            NOW(),
            NOW()
        );
    END IF;
END $$;

COMMIT;
