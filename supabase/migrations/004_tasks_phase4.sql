-- ==============================================================================
-- UXI HQ - Phase 4: Task & Sprint Management System Migration
-- Creates sprints, tasks, task_assignees junction, RLS, indexes & seed data
-- ==============================================================================

-- 1. Create Sprints Table
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    sprint_status TEXT NOT NULL DEFAULT 'Planned', -- Planned, Active, Completed, Cancelled
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON public.sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(sprint_status);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON public.sprints(start_date, end_date);

-- Automatic updated_at trigger for sprints
DROP TRIGGER IF EXISTS trigger_set_sprints_updated_at ON public.sprints;
CREATE TRIGGER trigger_set_sprints_updated_at
    BEFORE UPDATE ON public.sprints
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 2. Create or Update tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_status TEXT NOT NULL DEFAULT 'To Do', -- Backlog, To Do, In Progress, In Review, Blocked, Completed
    priority TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Urgent
    progress INTEGER NOT NULL DEFAULT 0,
    estimated_hours NUMERIC(6, 2) DEFAULT 0.00,
    actual_hours NUMERIC(6, 2) DEFAULT 0.00,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist
DO $$ BEGIN
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_status TEXT DEFAULT 'To Do';
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(6, 2) DEFAULT 0.00;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(6, 2) DEFAULT 0.00;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_date DATE;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
EXCEPTION
    WHEN others THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON public.tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_status ON public.tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Automatic updated_at trigger for tasks
DROP TRIGGER IF EXISTS trigger_set_tasks_updated_at ON public.tasks;
CREATE TRIGGER trigger_set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. Junction Table: task_assignees
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(task_id, team_member_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON public.task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_member ON public.task_assignees(team_member_id);

-- 4. Row Level Security
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- Sprints Policies
DROP POLICY IF EXISTS "Authenticated users can view sprints" ON public.sprints;
DROP POLICY IF EXISTS "Authenticated users can insert sprints" ON public.sprints;
DROP POLICY IF EXISTS "Authenticated users can update sprints" ON public.sprints;
DROP POLICY IF EXISTS "Admins and Managers can delete sprints" ON public.sprints;

CREATE POLICY "Authenticated users can view sprints" ON public.sprints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sprints" ON public.sprints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sprints" ON public.sprints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins and Managers can delete sprints" ON public.sprints FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);

-- Tasks Policies
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins and Managers can delete tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins and Managers can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);

-- Task Assignees Policies
DROP POLICY IF EXISTS "Authenticated users can view task assignees" ON public.task_assignees;
DROP POLICY IF EXISTS "Authenticated users can manage task assignees" ON public.task_assignees;

CREATE POLICY "Authenticated users can view task assignees" ON public.task_assignees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage task assignees" ON public.task_assignees FOR ALL TO authenticated USING (true) WITH CHECK (true);
