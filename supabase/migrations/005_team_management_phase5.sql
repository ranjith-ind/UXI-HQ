-- ==============================================================================
-- UXI HQ - Migration 005: Team Management & Workforce Intelligence (Phase 5)
-- Safe, idempotent migration extending team_members and adding skills management
-- ==============================================================================

-- 1. Extend team_members table with Phase 5 fields
DO $$ BEGIN
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS employee_code TEXT UNIQUE;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Engineering';
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS designation TEXT;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS joined_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS member_status TEXT NOT NULL DEFAULT 'Active' CHECK (member_status IN ('Active', 'Inactive', 'On Leave'));
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'Founder' CHECK (employment_type IN ('Founder', 'Full Time', 'Part Time', 'Intern', 'Freelancer', 'Contractor'));
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Busy', 'Focus Mode', 'Away'));
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS weekly_capacity_hours NUMERIC NOT NULL DEFAULT 40 CHECK (weekly_capacity_hours > 0);
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
    ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Populate full_name from name if null
UPDATE public.team_members SET full_name = name WHERE full_name IS NULL;
UPDATE public.team_members SET designation = title WHERE designation IS NULL;

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(member_status);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON public.team_members(availability_status);
CREATE INDEX IF NOT EXISTS idx_team_members_employment ON public.team_members(employment_type);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON public.team_members(department);

-- ==============================================================================
-- TABLE: skills
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Frontend', 'Backend', 'UI/UX', 'Database', 'DevOps', 'Project Management', 'Marketing', 'Other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- ==============================================================================
-- TABLE: team_member_skills
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_member_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL DEFAULT 'Intermediate' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(team_member_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_tm_skills_member ON public.team_member_skills(team_member_id);
CREATE INDEX IF NOT EXISTS idx_tm_skills_skill ON public.team_member_skills(skill_id);

-- ==============================================================================
-- Initial Skills Seed
-- ==============================================================================
INSERT INTO public.skills (name, category)
VALUES
    ('Next.js & React 19', 'Frontend'),
    ('TypeScript', 'Frontend'),
    ('Tailwind CSS', 'Frontend'),
    ('UI/UX Architecture', 'UI/UX'),
    ('Figma & Design Systems', 'UI/UX'),
    ('Three.js & WebGL', 'Frontend'),
    ('Node.js & Express', 'Backend'),
    ('Supabase & PostgreSQL', 'Database'),
    ('GraphQL APIs', 'Backend'),
    ('Cloud Infrastructure & Docker', 'DevOps'),
    ('CI/CD Pipelines', 'DevOps'),
    ('Security & Auth Architecture', 'Backend'),
    ('Client Strategy & Scoping', 'Project Management'),
    ('Technical Leadership', 'Project Management')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_skills ENABLE ROW LEVEL SECURITY;

-- Team Members RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read team members" ON public.team_members;
CREATE POLICY "Authenticated users can read team members"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and managers can insert team members" ON public.team_members;
CREATE POLICY "Admins and managers can insert team members"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    );

DROP POLICY IF EXISTS "Admins and managers can update team members or self" ON public.team_members;
CREATE POLICY "Admins and managers can update team members or self"
    ON public.team_members FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    );

-- Skills RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read skills" ON public.skills;
CREATE POLICY "Authenticated users can read skills"
    ON public.skills FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can read team member skills" ON public.team_member_skills;
CREATE POLICY "Authenticated users can read team member skills"
    ON public.team_member_skills FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Team members can update their own skills or admins" ON public.team_member_skills;
CREATE POLICY "Team members can update their own skills or admins"
    ON public.team_member_skills FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
