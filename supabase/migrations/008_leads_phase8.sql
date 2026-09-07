-- ==============================================================================
-- UXI HQ - Migration 008: Lead & Sales CRM Pipeline (Phase 8)
-- Full sales lifecycle: Leads, Activities, Follow-ups, and Client Conversion
-- ==============================================================================

-- 1. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    location TEXT,
    website TEXT,
    lead_source TEXT NOT NULL DEFAULT 'Website' CHECK (lead_source IN ('Website', 'Instagram', 'WhatsApp', 'Referral', 'LinkedIn', 'Direct Contact', 'Facebook', 'Email', 'Other')),
    lead_status TEXT NOT NULL DEFAULT 'New' CHECK (lead_status IN ('New', 'Contacted', 'Qualified', 'Discussion', 'Requirement Gathering', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    service_interest TEXT NOT NULL DEFAULT 'Web Application' CHECK (service_interest IN ('Business Website', 'Portfolio Website', 'E-Commerce', 'Web Application', 'SaaS Product', 'UI/UX Design', 'Custom Software', 'Maintenance', 'Other')),
    estimated_value NUMERIC NOT NULL DEFAULT 0 CHECK (estimated_value >= 0),
    probability INTEGER NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    next_follow_up_date DATE,
    last_contacted_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    description TEXT,
    requirements TEXT,
    notes TEXT,
    lost_reason TEXT,
    on_hold_reason TEXT,
    resume_date DATE,
    converted_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    converted_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_leads_code ON public.leads(lead_code);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_close_date ON public.leads(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_converted_client ON public.leads(converted_client_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- 2. Create Lead Activities Table
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL DEFAULT 'Note' CHECK (activity_type IN ('Note', 'Call', 'WhatsApp', 'Email', 'Meeting', 'Follow Up', 'Status Change', 'Proposal Sent', 'Requirement Update', 'Other')),
    title TEXT NOT NULL,
    description TEXT,
    activity_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_date ON public.lead_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON public.lead_activities(activity_type);

-- 3. Create Lead Follow-ups Table
CREATE TABLE IF NOT EXISTS public.lead_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    follow_up_date TIMESTAMPTZ NOT NULL,
    follow_up_type TEXT NOT NULL DEFAULT 'Call' CHECK (follow_up_type IN ('Call', 'WhatsApp', 'Email', 'Meeting', 'Other')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Missed', 'Cancelled')),
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_followups_lead ON public.lead_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_followups_date ON public.lead_followups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_lead_followups_status ON public.lead_followups(status);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads"
    ON public.leads FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and managers can manage leads" ON public.leads;
CREATE POLICY "Admins and managers can manage leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view lead activities" ON public.lead_activities;
CREATE POLICY "Authenticated users can view lead activities"
    ON public.lead_activities FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create lead activities" ON public.lead_activities;
CREATE POLICY "Authenticated users can create lead activities"
    ON public.lead_activities FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view lead followups" ON public.lead_followups;
CREATE POLICY "Authenticated users can view lead followups"
    ON public.lead_followups FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage lead followups" ON public.lead_followups;
CREATE POLICY "Authenticated users can manage lead followups"
    ON public.lead_followups FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
