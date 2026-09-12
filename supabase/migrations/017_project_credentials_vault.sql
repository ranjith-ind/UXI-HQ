-- ==============================================================================
-- UXI HQ - Migration 017: Project Credentials Vault
--
-- Features:
--   1. Secure storage for project credentials (Domain, Hosting, Database, Admin Panel, Cloudflare, GitHub, Vercel, API Key, Server / SSH, Other)
--   2. Dynamic custom fields for additional server/port/environment configuration
--   3. Audit activity logging (Created, Updated, Viewed, Copied, Deleted)
--   4. Strict RBAC & Row Level Security:
--      - Admin & Manager: Full access (ALL operations)
--      - Developer: SELECT only on credentials for projects where they are assigned in project_members
--      - Client: No access
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Create Tables
-- ------------------------------------------------------------------------------

-- Table: public.project_credentials
CREATE TABLE IF NOT EXISTS public.project_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    credential_type TEXT NOT NULL,
    url TEXT,
    username TEXT,
    encrypted_password TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: public.credential_custom_fields
CREATE TABLE IF NOT EXISTS public.credential_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES public.project_credentials(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_value TEXT NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: public.credential_activity_logs
CREATE TABLE IF NOT EXISTS public.credential_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES public.project_credentials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Create Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_project_credentials_project_id ON public.project_credentials(project_id);
CREATE INDEX IF NOT EXISTS idx_project_credentials_credential_type ON public.project_credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_project_credentials_created_at ON public.project_credentials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credential_custom_fields_credential_id ON public.credential_custom_fields(credential_id);

CREATE INDEX IF NOT EXISTS idx_credential_activity_logs_credential_id ON public.credential_activity_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_activity_logs_created_at ON public.credential_activity_logs(created_at DESC);

-- Trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS trigger_set_project_credentials_updated_at ON public.project_credentials;
CREATE TRIGGER trigger_set_project_credentials_updated_at
    BEFORE UPDATE ON public.project_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 3. Grants to 'authenticated'
-- ------------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.credential_custom_fields TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.credential_activity_logs TO authenticated;

-- ------------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. Helper Function: Check if user has access to project credentials
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_view_project_credentials(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT (
    -- Admin or Manager has full access across all projects
    public.is_admin_or_manager()
    OR
    -- Developer has access if assigned to project in project_members
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = p_project_id
        AND pm.user_id = COALESCE(
          auth.uid(),
          (NULLIF(current_setting('request.jwt.claim.sub', true), ''))::uuid,
          (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid,
          (auth.jwt() ->> 'sub')::uuid
        )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_view_project_credentials(UUID) TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 6. RLS Policies: project_credentials
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "project_credentials_select_policy" ON public.project_credentials;
CREATE POLICY "project_credentials_select_policy"
    ON public.project_credentials FOR SELECT
    TO authenticated
    USING (public.can_view_project_credentials(project_id));

DROP POLICY IF EXISTS "project_credentials_insert_policy" ON public.project_credentials;
CREATE POLICY "project_credentials_insert_policy"
    ON public.project_credentials FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "project_credentials_update_policy" ON public.project_credentials;
CREATE POLICY "project_credentials_update_policy"
    ON public.project_credentials FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "project_credentials_delete_policy" ON public.project_credentials;
CREATE POLICY "project_credentials_delete_policy"
    ON public.project_credentials FOR DELETE
    TO authenticated
    USING (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 7. RLS Policies: credential_custom_fields
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "credential_custom_fields_select_policy" ON public.credential_custom_fields;
CREATE POLICY "credential_custom_fields_select_policy"
    ON public.credential_custom_fields FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.project_credentials pc
        WHERE pc.id = credential_id
          AND public.can_view_project_credentials(pc.project_id)
      )
    );

DROP POLICY IF EXISTS "credential_custom_fields_manage_policy" ON public.credential_custom_fields;
CREATE POLICY "credential_custom_fields_manage_policy"
    ON public.credential_custom_fields FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 8. RLS Policies: credential_activity_logs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "credential_activity_logs_select_policy" ON public.credential_activity_logs;
CREATE POLICY "credential_activity_logs_select_policy"
    ON public.credential_activity_logs FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.project_credentials pc
        WHERE pc.id = credential_id
          AND public.can_view_project_credentials(pc.project_id)
      )
    );

DROP POLICY IF EXISTS "credential_activity_logs_insert_policy" ON public.credential_activity_logs;
CREATE POLICY "credential_activity_logs_insert_policy"
    ON public.credential_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authenticated_user());

COMMIT;

-- ------------------------------------------------------------------------------
-- 9. Reload PostgREST schema cache
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
