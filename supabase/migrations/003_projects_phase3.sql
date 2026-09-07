-- ==============================================================================
-- UXI HQ - Phase 3: Project Management System Migration
-- Creates/Updates projects, project_members junction table, RLS, indexes & seed data
-- ==============================================================================

-- 1. Create Enums for Project Management
DO $$ BEGIN
    CREATE TYPE project_status_v2 AS ENUM (
        'Lead',
        'Discussion',
        'Confirmed',
        'Designing',
        'Development',
        'Testing',
        'Client Review',
        'Delivered',
        'Completed',
        'On Hold',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_priority_type AS ENUM ('Low', 'Medium', 'High', 'Urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create or Update projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    project_name TEXT NOT NULL,
    project_code TEXT UNIQUE NOT NULL,
    project_type TEXT NOT NULL DEFAULT 'Web Application',
    description TEXT,
    requirements TEXT,
    project_status TEXT NOT NULL DEFAULT 'Confirmed',
    priority TEXT NOT NULL DEFAULT 'Medium',
    estimated_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    final_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE,
    estimated_deadline DATE,
    actual_completion_date DATE,
    project_url TEXT,
    repository_url TEXT,
    project_notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist if table was created in Phase 1
DO $$ BEGIN
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_name TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_code TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Web Application';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS requirements TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'Confirmed';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS final_budget NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_paid_amount NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pending_amount NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_deadline DATE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS actual_completion_date DATE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS repository_url TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_notes TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 3. Indexes on projects table
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_estimated_deadline ON public.projects(estimated_deadline);
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON public.projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON public.projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS trigger_set_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. Junction Table: project_members
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role_in_project TEXT DEFAULT 'Contributor',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(project_id, team_member_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_member ON public.project_members(team_member_id);

-- 5. Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and Managers can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins and Managers can delete projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Authenticated users can manage project members" ON public.project_members;

CREATE POLICY "Authenticated users can view project members"
    ON public.project_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage project members"
    ON public.project_members FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Seed Initial Projects linked to Phase 2 Clients
DO $$
DECLARE
    v_finpulse_id UUID;
    v_aura_id UUID;
    v_omni_id UUID;
    v_nexus_id UUID;
    v_krypton_id UUID;
    v_proj1_id UUID;
    v_proj2_id UUID;
    v_proj3_id UUID;
    v_proj4_id UUID;
    v_proj5_id UUID;
    v_ranjith_id UUID;
    v_hafi_id UUID;
    v_vedesh_id UUID;
    v_praneeth_id UUID;
BEGIN
    SELECT id INTO v_finpulse_id FROM public.clients WHERE company_name = 'FinPulse Technologies' LIMIT 1;
    SELECT id INTO v_aura_id FROM public.clients WHERE company_name = 'Aura Brands Inc' LIMIT 1;
    SELECT id INTO v_omni_id FROM public.clients WHERE company_name = 'OmniHealth Care' LIMIT 1;
    SELECT id INTO v_nexus_id FROM public.clients WHERE company_name = 'Nexus Freight Ltd' LIMIT 1;
    SELECT id INTO v_krypton_id FROM public.clients WHERE company_name = 'Krypton Labs' LIMIT 1;

    SELECT id INTO v_ranjith_id FROM public.team_members WHERE name = 'Ranjith' LIMIT 1;
    SELECT id INTO v_hafi_id FROM public.team_members WHERE name = 'Hafi' LIMIT 1;
    SELECT id INTO v_vedesh_id FROM public.team_members WHERE name = 'Vedesh' LIMIT 1;
    SELECT id INTO v_praneeth_id FROM public.team_members WHERE name = 'Praneeth' LIMIT 1;

    IF v_finpulse_id IS NOT NULL THEN
        INSERT INTO public.projects (
            client_id, project_name, project_code, project_type, description, requirements,
            project_status, priority, estimated_budget, final_budget, currency, advance_amount,
            total_paid_amount, pending_amount, start_date, estimated_deadline, project_url, repository_url, project_notes
        ) VALUES (
            v_finpulse_id, 'FinPulse Banking Portal', 'UXI-2026-001', 'Web Application',
            'Next-generation merchant portal and core banking analytics dashboard with KYC verification flow.',
            '1. Secure OAuth2 & 2FA Auth\n2. Real-time transaction webhooks\n3. High-throughput ledger reconciliation\n4. Dark mode banking UI',
            'Development', 'Urgent', 450000.00, 450000.00, 'INR', 225000.00, 225000.00, 225000.00,
            CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '17 days',
            'https://portal.finpulse.io', 'https://github.com/uxi-tech/finpulse-banking-portal',
            'Milestone #2 frontend integration is active. Lead engineer Praneeth handling database caching.'
        ) ON CONFLICT (project_code) DO NOTHING RETURNING id INTO v_proj1_id;
    END IF;

    IF v_aura_id IS NOT NULL THEN
        INSERT INTO public.projects (
            client_id, project_name, project_code, project_type, description, requirements,
            project_status, priority, estimated_budget, final_budget, currency, advance_amount,
            total_paid_amount, pending_amount, start_date, estimated_deadline, project_url, repository_url, project_notes
        ) VALUES (
            v_aura_id, 'Aura Luxury Ecommerce', 'UXI-2026-002', 'E-Commerce Website',
            'Headless luxury brand storefront with 3D product view, Shopify Plus integration and customized checkout experience.',
            '1. Headless Next.js storefront\n2. Ultra-fast sub-second page loads\n3. Custom product 3D carousel\n4. Multi-currency checkout',
            'Client Review', 'High', 320000.00, 320000.00, 'INR', 200000.00, 200000.00, 120000.00,
            CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '7 days',
            'https://aurabrands.com', 'https://github.com/uxi-tech/aura-luxury-storefront',
            'Design lead Vedesh presented the staging build to Sophia Laurent. Final sign-off pending this week.'
        ) ON CONFLICT (project_code) DO NOTHING RETURNING id INTO v_proj2_id;
    END IF;

    IF v_omni_id IS NOT NULL THEN
        INSERT INTO public.projects (
            client_id, project_name, project_code, project_type, description, requirements,
            project_status, priority, estimated_budget, final_budget, currency, advance_amount,
            total_paid_amount, pending_amount, start_date, estimated_deadline, project_url, repository_url, project_notes
        ) VALUES (
            v_omni_id, 'OmniHealth Patient Cloud', 'UXI-2026-003', 'SaaS Platform',
            'Telemedicine patient record portal, automated prescription manager and doctor calendar system.',
            '1. HIPAA compliant cloud storage\n2. WebRTC video consultation\n3. Patient health vitals telemetry\n4. SMS/WhatsApp alerts',
            'Designing', 'High', 680000.00, 680000.00, 'INR', 340000.00, 340000.00, 340000.00,
            CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '30 days',
            'https://cloud.omnihealthcare.in', 'https://github.com/uxi-tech/omnihealth-cloud',
            'CTO Hafi leading distributed system setup on Google Cloud with microservices.'
        ) ON CONFLICT (project_code) DO NOTHING RETURNING id INTO v_proj3_id;
    END IF;

    IF v_nexus_id IS NOT NULL THEN
        INSERT INTO public.projects (
            client_id, project_name, project_code, project_type, description, requirements,
            project_status, priority, estimated_budget, final_budget, currency, advance_amount,
            total_paid_amount, pending_amount, start_date, estimated_deadline, project_url, repository_url, project_notes
        ) VALUES (
            v_nexus_id, 'Nexus Global Logistics CMS', 'UXI-2026-004', 'Custom Software',
            'Enterprise logistics container tracking, driver route dispatch and multi-warehouse inventory CMS.',
            '1. Real-time GPS container tracking\n2. Multi-region warehouse inventory\n3. Driver mobile dispatch',
            'Discussion', 'Medium', 520000.00, 520000.00, 'INR', 0.00, 0.00, 520000.00,
            CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days',
            NULL, 'https://github.com/uxi-tech/nexus-freight-cms',
            'CEO Ranjith in talks with David Sterling for scope lock and initial 40% advance milestone.'
        ) ON CONFLICT (project_code) DO NOTHING RETURNING id INTO v_proj4_id;
    END IF;

    IF v_krypton_id IS NOT NULL THEN
        INSERT INTO public.projects (
            client_id, project_name, project_code, project_type, description, requirements,
            project_status, priority, estimated_budget, final_budget, currency, advance_amount,
            total_paid_amount, pending_amount, start_date, estimated_deadline, actual_completion_date, project_url, repository_url, project_notes
        ) VALUES (
            v_krypton_id, 'Krypton Web3 Exchange UI', 'UXI-2026-005', 'Admin Dashboard',
            'High-frequency trading terminal and cryptocurrency liquidity dashboard with WebSockets.',
            '1. Low latency WebSocket charts\n2. Orderbook depth visualization\n3. Multi-wallet Web3 connection',
            'Completed', 'Medium', 380000.00, 380000.00, 'INR', 380000.00, 380000.00, 0.00,
            CURRENT_DATE - INTERVAL '70 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days',
            'https://kryptonlabs.io', 'https://github.com/uxi-tech/krypton-exchange-ui',
            'Project completed with 100% client satisfaction and 5-star testimonial.'
        ) ON CONFLICT (project_code) DO NOTHING RETURNING id INTO v_proj5_id;
    END IF;
END $$;
