-- ==============================================================================
-- UXI HQ - Phase 2: Clients Management Migration
-- Extends clients table with full_name, whatsapp_number, location, source, client_status
-- ==============================================================================

-- 1. Create client_status & client_source enums if not exist
DO $$ BEGIN
    CREATE TYPE client_status_type AS ENUM ('Lead', 'Active', 'Inactive', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_source_type AS ENUM ('Referral', 'Instagram', 'WhatsApp', 'Website', 'LinkedIn', 'Direct Contact', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure Clients Table matches Phase 2 Specifications
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    location TEXT,
    website TEXT,
    client_status client_status_type NOT NULL DEFAULT 'Active',
    source client_source_type NOT NULL DEFAULT 'Direct Contact',
    notes TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- If clients table existed from Phase 1, ensure all columns exist
DO $$ BEGIN
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_status client_status_type DEFAULT 'Active';
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source client_source_type DEFAULT 'Direct Contact';
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS avatar_url TEXT;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Indexes for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON public.clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(client_status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_clients_updated_at ON public.clients;
CREATE TRIGGER trigger_set_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed to refresh
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins and Managers can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated read on clients" ON public.clients;

-- RLS Policies
CREATE POLICY "Authenticated users can view clients"
    ON public.clients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert clients"
    ON public.clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
    ON public.clients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins and Managers can delete clients"
    ON public.clients FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Manager')
        )
    );

-- Seed realistic sample clients for UXI
INSERT INTO public.clients (full_name, company_name, email, phone, whatsapp_number, location, website, client_status, source, notes)
VALUES
    ('Vikramaditya Sharma', 'FinPulse Technologies', 'vikram@finpulse.io', '+91 98450 11223', '+91 98450 11223', 'Bengaluru, India', 'https://finpulse.io', 'Active', 'Referral', 'Enterprise fintech platform client. Currently building next-gen web portal.'),
    ('Sophia Laurent', 'Aura Brands Inc', 'sophia@aurabrands.com', '+1 (415) 890-3344', '+14158903344', 'San Francisco, USA', 'https://aurabrands.com', 'Active', 'Website', 'Luxury lifestyle brand. High fidelity UX/UI required. Design lead: Vedesh.'),
    ('Dr. Rajesh Menon', 'OmniHealth Care', 'dr.menon@omnihealth.in', '+91 98840 99882', '+91 98840 99882', 'Hyderabad, India', 'https://omnihealthcare.in', 'Active', 'LinkedIn', 'Healthcare cloud systems and patient management portal. CTO lead: Hafi.'),
    ('David Sterling', 'Nexus Freight Ltd', 'david.s@nexusfreight.co.uk', '+44 20 7946 0912', '+442079460912', 'London, UK', 'https://nexusfreight.co.uk', 'Lead', 'Direct Contact', 'Global freight logistics CMS redesign. Proposal submitted, awaiting final PO.'),
    ('Elena Rostova', 'Krypton Labs', 'elena@kryptonlabs.io', '+971 50 123 4567', '+971501234567', 'Dubai, UAE', 'https://kryptonlabs.io', 'Completed', 'Instagram', 'Web3 exchange dashboard design and responsive front-end completed on schedule.')
ON CONFLICT DO NOTHING;
