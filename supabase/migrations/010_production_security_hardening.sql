-- ==============================================================================
-- UXI HQ - Migration 010: Production Security Hardening & Complete RLS Coverage
-- Enables Row Level Security (RLS) across all auxiliary tables and tightens read access
-- ==============================================================================

-- 1. Enable RLS on Auxiliary Tables
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_skills ENABLE ROW LEVEL SECURITY;

-- 2. Tighten Profiles & Team Members Read Policies to Authenticated Users
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on team members" ON public.team_members;

CREATE POLICY "Allow authenticated read on profiles" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on team members" 
    ON public.team_members FOR SELECT 
    TO authenticated 
    USING (true);

-- 3. Add Authenticated RLS Policies for Sprints
DROP POLICY IF EXISTS "Allow authenticated manage on sprints" ON public.sprints;
CREATE POLICY "Allow authenticated manage on sprints" 
    ON public.sprints FOR ALL 
    TO authenticated 
    USING (true);

-- 4. Add Authenticated RLS Policies for Invoices & Invoice Items
DROP POLICY IF EXISTS "Allow authenticated read on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated insert update on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated update on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin delete on invoices" ON public.invoices;

CREATE POLICY "Allow authenticated read on invoices" 
    ON public.invoices FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated insert on invoices" 
    ON public.invoices FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on invoices" 
    ON public.invoices FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow admin delete on invoices" 
    ON public.invoices FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
    );

DROP POLICY IF EXISTS "Allow authenticated manage on invoice items" ON public.invoice_items;
CREATE POLICY "Allow authenticated manage on invoice items" 
    ON public.invoice_items FOR ALL 
    TO authenticated 
    USING (true);

-- 5. Add Authenticated RLS Policies for Leads, Lead Activities & Follow-ups
DROP POLICY IF EXISTS "Allow authenticated read on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated insert on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated update on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin delete on leads" ON public.leads;

CREATE POLICY "Allow authenticated read on leads" 
    ON public.leads FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated insert on leads" 
    ON public.leads FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on leads" 
    ON public.leads FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow admin delete on leads" 
    ON public.leads FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
    );

DROP POLICY IF EXISTS "Allow authenticated manage on lead activities" ON public.lead_activities;
CREATE POLICY "Allow authenticated manage on lead activities" 
    ON public.lead_activities FOR ALL 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage on lead followups" ON public.lead_followups;
CREATE POLICY "Allow authenticated manage on lead followups" 
    ON public.lead_followups FOR ALL 
    TO authenticated 
    USING (true);

-- 6. Add Authenticated RLS Policies for Skills & Team Member Skills
DROP POLICY IF EXISTS "Allow authenticated read on skills" ON public.skills;
DROP POLICY IF EXISTS "Allow admin manage on skills" ON public.skills;

CREATE POLICY "Allow authenticated read on skills" 
    ON public.skills FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow admin manage on skills" 
    ON public.skills FOR ALL 
    TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
    );

DROP POLICY IF EXISTS "Allow authenticated manage on team member skills" ON public.team_member_skills;
CREATE POLICY "Allow authenticated manage on team member skills" 
    ON public.team_member_skills FOR ALL 
    TO authenticated 
    USING (true);
