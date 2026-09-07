-- ==============================================================================
-- UXI HQ - Migration 007: Expense Management & Profitability Intelligence (Phase 7)
-- Complete expense tracking, recurring templates, categories & profitability
-- ==============================================================================

-- 1. Create Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default categories
INSERT INTO public.expense_categories (name, description, icon) VALUES
    ('Hosting & Infrastructure', 'Cloud servers, CDN, and database hosting (Vercel, AWS, Supabase, Cloudflare)', 'Server'),
    ('Domains', 'Domain registrations, DNS management, and SSL certificates', 'Globe'),
    ('Software & Subscriptions', 'Developer tools, SaaS licenses, design software (Figma, GitHub, Linear, OpenAI)', 'AppWindow'),
    ('Team Payments', 'Internal compensation, performance bonuses, and founder disbursements', 'Users'),
    ('Freelancer Payments', 'External contractors, specialized consultants, and freelance developers', 'UserCheck'),
    ('Marketing', 'Content creation, branding assets, copywriting, and promotional materials', 'Megaphone'),
    ('Advertising', 'Paid acquisition campaigns (Google Ads, Meta, LinkedIn Ads)', 'TrendingUp'),
    ('Office Expenses', 'Co-working passes, utilities, software office supplies, and team amenities', 'Building'),
    ('Equipment', 'Hardware workstations, monitors, laptops, and peripheral engineering tools', 'Laptop'),
    ('Travel', 'Client on-site visits, business transportation, and conference travel', 'Plane'),
    ('Client Project Expenses', 'Direct client-specific assets, themes, plugins, and third-party APIs', 'FolderKanban'),
    ('Legal & Compliance', 'Company registrations, accounting fees, GST compliance, and legal retainers', 'ShieldCheck'),
    ('Training & Education', 'Technical certifications, engineering workshops, and reference materials', 'BookOpen'),
    ('Miscellaneous', 'Other operational overhead and unforeseen operational expenses', 'HelpCircle')
ON CONFLICT (name) DO NOTHING;

-- 2. Create/Recreate Expenses Table
DROP TABLE IF EXISTS public.expenses CASCADE;
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_number TEXT UNIQUE NOT NULL,
    expense_title TEXT NOT NULL,
    description TEXT,
    expense_category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL DEFAULT 'Miscellaneous',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    vendor_name TEXT,
    vendor_contact TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_status TEXT NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled')),
    payment_method TEXT NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method IN ('Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Debit Card', 'Other')),
    transaction_reference TEXT,
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('Weekly', 'Monthly', 'Quarterly', 'Yearly')),
    next_recurring_date DATE,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_client ON public.expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON public.expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON public.expenses(is_recurring);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read expense categories" ON public.expense_categories;
CREATE POLICY "Authenticated users can read expense categories"
    ON public.expense_categories FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and managers can manage expense categories" ON public.expense_categories;
CREATE POLICY "Admins and managers can manage expense categories"
    ON public.expense_categories FOR ALL
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

DROP POLICY IF EXISTS "Authenticated users can read expenses" ON public.expenses;
CREATE POLICY "Authenticated users can read expenses"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins and managers can manage expenses" ON public.expenses;
CREATE POLICY "Admins and managers can manage expenses"
    ON public.expenses FOR ALL
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
