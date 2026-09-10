-- ==============================================================================
-- UXI HQ - Migration 014: Production System-Wide RBAC & SECURITY DEFINER Functions
-- Solves RLS subquery recursion and profiles visibility restrictions under authenticated
-- Principle of Least Privilege:
--   1. Preserves strict RBAC: Only Admin and Manager roles can write operational records.
--   2. Preserves RLS on all tables across the public schema.
--   3. Uses canonical PostgreSQL / Supabase SECURITY DEFINER STABLE functions with fixed search_path.
--   4. Grants EXECUTE to authenticated and anon roles.
--   5. Reloads PostgREST schema cache.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Table-Level Grants to 'authenticated'
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;

-- Operational tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.task_assignees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sprints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invoice_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expense_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.team_member_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lead_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lead_followups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notification_preferences TO authenticated;
GRANT SELECT, INSERT ON TABLE public.activity_logs TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Conditional grant if subtasks table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subtasks') THEN
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subtasks TO authenticated;';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Canonical SECURITY DEFINER RBAC Functions
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = COALESCE(
      auth.uid(),
      (NULLIF(current_setting('request.jwt.claim.sub', true), ''))::uuid,
      (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid,
      (auth.jwt() ->> 'sub')::uuid
    )
    AND role IN ('Admin', 'Manager')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = COALESCE(
      auth.uid(),
      (NULLIF(current_setting('request.jwt.claim.sub', true), ''))::uuid,
      (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid,
      (auth.jwt() ->> 'sub')::uuid
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_authenticated_user() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 3. Row Level Security Activation
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. Profiles RLS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin_or_manager())
    WITH CHECK (id = auth.uid() OR public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 5. Clients RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated read on clients" ON public.clients;
CREATE POLICY "clients_select_policy"
    ON public.clients FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated insert on clients" ON public.clients;
CREATE POLICY "clients_insert_policy"
    ON public.clients FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated update on clients" ON public.clients;
CREATE POLICY "clients_update_policy"
    ON public.clients FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;
DROP POLICY IF EXISTS "Admins and Managers can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin delete on clients" ON public.clients;
CREATE POLICY "clients_delete_policy"
    ON public.clients FOR DELETE
    TO authenticated
    USING (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 6. Projects & Project Members RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated read on projects" ON public.projects;
CREATE POLICY "projects_select_policy"
    ON public.projects FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
CREATE POLICY "projects_insert_policy"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
CREATE POLICY "projects_update_policy"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "Admins and Managers can delete projects" ON public.projects;
CREATE POLICY "projects_delete_policy"
    ON public.projects FOR DELETE
    TO authenticated
    USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "project_members_select_policy" ON public.project_members;
DROP POLICY IF EXISTS "Authenticated users can view project members" ON public.project_members;
CREATE POLICY "project_members_select_policy"
    ON public.project_members FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "project_members_manage_policy" ON public.project_members;
DROP POLICY IF EXISTS "Authenticated users can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Allow authenticated manage on project members" ON public.project_members;
CREATE POLICY "project_members_manage_policy"
    ON public.project_members FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 7. Team Members & Skills RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "team_members_select_policy" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can read team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated read on team members" ON public.team_members;
CREATE POLICY "team_members_select_policy"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "team_members_insert_policy" ON public.team_members;
DROP POLICY IF EXISTS "Admins and managers can insert team members" ON public.team_members;
CREATE POLICY "team_members_insert_policy"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "team_members_update_policy" ON public.team_members;
DROP POLICY IF EXISTS "Admins and managers can update team members or self" ON public.team_members;
CREATE POLICY "team_members_update_policy"
    ON public.team_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin_or_manager())
    WITH CHECK (user_id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "team_members_delete_policy" ON public.team_members;
CREATE POLICY "team_members_delete_policy"
    ON public.team_members FOR DELETE
    TO authenticated
    USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "skills_select_policy" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can read skills" ON public.skills;
DROP POLICY IF EXISTS "Allow authenticated read on skills" ON public.skills;
CREATE POLICY "skills_select_policy"
    ON public.skills FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "skills_manage_policy" ON public.skills;
DROP POLICY IF EXISTS "Allow admin manage on skills" ON public.skills;
CREATE POLICY "skills_manage_policy"
    ON public.skills FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "team_member_skills_select_policy" ON public.team_member_skills;
DROP POLICY IF EXISTS "Authenticated users can read team member skills" ON public.team_member_skills;
CREATE POLICY "team_member_skills_select_policy"
    ON public.team_member_skills FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "team_member_skills_manage_policy" ON public.team_member_skills;
DROP POLICY IF EXISTS "Team members can update their own skills or admins" ON public.team_member_skills;
CREATE POLICY "team_member_skills_manage_policy"
    ON public.team_member_skills FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.id = team_member_skills.team_member_id
              AND tm.user_id = auth.uid()
        )
        OR public.is_admin_or_manager()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.id = team_member_skills.team_member_id
              AND tm.user_id = auth.uid()
        )
        OR public.is_admin_or_manager()
    );

-- ------------------------------------------------------------------------------
-- 8. Tasks, Sprints & Assignees RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "sprints_select_policy" ON public.sprints;
DROP POLICY IF EXISTS "Authenticated users can view sprints" ON public.sprints;
CREATE POLICY "sprints_select_policy"
    ON public.sprints FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "sprints_manage_policy" ON public.sprints;
DROP POLICY IF EXISTS "Authenticated users can insert sprints" ON public.sprints;
DROP POLICY IF EXISTS "Authenticated users can update sprints" ON public.sprints;
DROP POLICY IF EXISTS "Admins and Managers can delete sprints" ON public.sprints;
DROP POLICY IF EXISTS "Allow authenticated manage on sprints" ON public.sprints;
CREATE POLICY "sprints_manage_policy"
    ON public.sprints FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "tasks_select_policy"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
CREATE POLICY "tasks_insert_policy"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
CREATE POLICY "tasks_update_policy"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_or_manager()
        OR EXISTS (
            SELECT 1 FROM public.task_assignees ta
            JOIN public.team_members tm ON tm.id::text = ta.team_member_id::text
            WHERE ta.task_id = tasks.id
              AND tm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin_or_manager()
        OR EXISTS (
            SELECT 1 FROM public.task_assignees ta
            JOIN public.team_members tm ON tm.id::text = ta.team_member_id::text
            WHERE ta.task_id = tasks.id
              AND tm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
DROP POLICY IF EXISTS "Admins and Managers can delete tasks" ON public.tasks;
CREATE POLICY "tasks_delete_policy"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "task_assignees_select_policy" ON public.task_assignees;
DROP POLICY IF EXISTS "Authenticated users can view task assignees" ON public.task_assignees;
CREATE POLICY "task_assignees_select_policy"
    ON public.task_assignees FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "task_assignees_manage_policy" ON public.task_assignees;
DROP POLICY IF EXISTS "Authenticated users can manage task assignees" ON public.task_assignees;
CREATE POLICY "task_assignees_manage_policy"
    ON public.task_assignees FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 9. Finance: Invoices, Invoice Items & Payments RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated read on invoices" ON public.invoices;
CREATE POLICY "invoices_select_policy"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "invoices_manage_policy" ON public.invoices;
DROP POLICY IF EXISTS "Admins and managers can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated insert update on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated insert on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated update on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin delete on invoices" ON public.invoices;
CREATE POLICY "invoices_manage_policy"
    ON public.invoices FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "invoice_items_select_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can read invoice items" ON public.invoice_items;
CREATE POLICY "invoice_items_select_policy"
    ON public.invoice_items FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "invoice_items_manage_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins and managers can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow authenticated manage on invoice items" ON public.invoice_items;
CREATE POLICY "invoice_items_manage_policy"
    ON public.invoice_items FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can read payments" ON public.payments;
CREATE POLICY "payments_select_policy"
    ON public.payments FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "payments_manage_policy" ON public.payments;
DROP POLICY IF EXISTS "Admins and managers can manage payments" ON public.payments;
CREATE POLICY "payments_manage_policy"
    ON public.payments FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 10. Expenses & Categories RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "expense_categories_select_policy" ON public.expense_categories;
DROP POLICY IF EXISTS "Authenticated users can read expense categories" ON public.expense_categories;
CREATE POLICY "expense_categories_select_policy"
    ON public.expense_categories FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "expense_categories_manage_policy" ON public.expense_categories;
DROP POLICY IF EXISTS "Admins and managers can manage expense categories" ON public.expense_categories;
CREATE POLICY "expense_categories_manage_policy"
    ON public.expense_categories FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "expenses_select_policy" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can read expenses" ON public.expenses;
CREATE POLICY "expenses_select_policy"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "expenses_manage_policy" ON public.expenses;
DROP POLICY IF EXISTS "Admins and managers can manage expenses" ON public.expenses;
CREATE POLICY "expenses_manage_policy"
    ON public.expenses FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 11. Leads, Lead Activities & Follow-ups RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated read on leads" ON public.leads;
CREATE POLICY "leads_select_policy"
    ON public.leads FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "leads_manage_policy" ON public.leads;
DROP POLICY IF EXISTS "Admins and managers can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated update on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin delete on leads" ON public.leads;
CREATE POLICY "leads_manage_policy"
    ON public.leads FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "lead_activities_select_policy" ON public.lead_activities;
DROP POLICY IF EXISTS "Authenticated users can view lead activities" ON public.lead_activities;
CREATE POLICY "lead_activities_select_policy"
    ON public.lead_activities FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "lead_activities_insert_policy" ON public.lead_activities;
DROP POLICY IF EXISTS "Authenticated users can create lead activities" ON public.lead_activities;
CREATE POLICY "lead_activities_insert_policy"
    ON public.lead_activities FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authenticated_user());

DROP POLICY IF EXISTS "lead_followups_select_policy" ON public.lead_followups;
DROP POLICY IF EXISTS "Authenticated users can view lead followups" ON public.lead_followups;
CREATE POLICY "lead_followups_select_policy"
    ON public.lead_followups FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "lead_followups_manage_policy" ON public.lead_followups;
DROP POLICY IF EXISTS "Authenticated users can manage lead followups" ON public.lead_followups;
CREATE POLICY "lead_followups_manage_policy"
    ON public.lead_followups FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

-- ------------------------------------------------------------------------------
-- 12. Business Alerts, Notifications & Activity Logs RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "business_alerts_select_policy" ON public.business_alerts;
DROP POLICY IF EXISTS "Authenticated can select business alerts" ON public.business_alerts;
CREATE POLICY "business_alerts_select_policy"
    ON public.business_alerts FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "business_alerts_manage_policy" ON public.business_alerts;
DROP POLICY IF EXISTS "Authenticated can manage business alerts" ON public.business_alerts;
CREATE POLICY "business_alerts_manage_policy"
    ON public.business_alerts FOR ALL
    TO authenticated
    USING (public.is_admin_or_manager())
    WITH CHECK (public.is_admin_or_manager());

DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
CREATE POLICY "notifications_select_policy"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "notifications_manage_policy" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "notifications_manage_policy"
    ON public.notifications FOR ALL
    TO authenticated
    USING (recipient_id = auth.uid() OR public.is_admin_or_manager())
    WITH CHECK (recipient_id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "notification_preferences_select_policy" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select_policy"
    ON public.notification_preferences FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "notification_preferences_manage_policy" ON public.notification_preferences;
CREATE POLICY "notification_preferences_manage_policy"
    ON public.notification_preferences FOR ALL
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_admin_or_manager())
    WITH CHECK (profile_id = auth.uid() OR public.is_admin_or_manager());

DROP POLICY IF EXISTS "activity_logs_select_policy" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
CREATE POLICY "activity_logs_select_policy"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (public.is_authenticated_user());

DROP POLICY IF EXISTS "activity_logs_insert_policy" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_policy"
    ON public.activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authenticated_user());

-- ------------------------------------------------------------------------------
-- 13. Reload Schema Cache
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ------------------------------------------------------------------------------
-- 14. Diagnostic & Verification Test
-- ------------------------------------------------------------------------------
SELECT 
    u.id AS auth_user_id,
    u.email AS auth_email,
    p.role AS profile_role,
    public.is_admin_or_manager() AS is_admin_or_manager_eval,
    public.is_authenticated_user() AS is_authenticated_user_eval
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'ranjithkumartirumalasetti@gmail.com';
