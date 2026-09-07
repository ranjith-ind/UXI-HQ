-- ==============================================================================
-- UXI HQ (Unified Xperience Intelligence) - Master Database Schema
-- Complete Foundation: Profiles, Team, Clients (Phase 2), Projects, Tasks, Payments, Expenses, Logs
-- Run this in your Supabase SQL Editor at https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'review', 'completed', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('software', 'infrastructure', 'marketing', 'hardware', 'contractor', 'office', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- TABLE: profiles (Extends auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Developer',
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- TABLE: team_members (Phase 5 Full Workforce Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'Developer',
    department TEXT NOT NULL DEFAULT 'Software Engineering',
    designation TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    member_status TEXT NOT NULL DEFAULT 'Active' CHECK (member_status IN ('Active', 'Inactive', 'On Leave')),
    employment_type TEXT NOT NULL DEFAULT 'Founder' CHECK (employment_type IN ('Founder', 'Full Time', 'Part Time', 'Intern', 'Freelancer', 'Contractor')),
    availability_status TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Busy', 'Focus Mode', 'Away')),
    weekly_capacity_hours NUMERIC NOT NULL DEFAULT 40 CHECK (weekly_capacity_hours > 0),
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    is_founder BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(member_status);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON public.team_members(availability_status);
CREATE INDEX IF NOT EXISTS idx_team_members_employment ON public.team_members(employment_type);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON public.team_members(department);

-- ==============================================================================
-- TABLE: skills (Phase 5)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Frontend', 'Backend', 'UI/UX', 'Database', 'DevOps', 'Project Management', 'Marketing', 'Other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- ==============================================================================
-- TABLE: team_member_skills (Phase 5)
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
-- TABLE: clients (Phase 2 Full Specification)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_clients_full_name ON public.clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(client_status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- ==============================================================================
-- TABLE: projects
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_estimated_deadline ON public.projects(estimated_deadline);
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON public.projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON public.projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ==============================================================================
-- TABLE: project_members (Junction)
-- ==============================================================================
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

-- ==============================================================================
-- TABLE: sprints (Phase 4)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    sprint_status TEXT NOT NULL DEFAULT 'Planned' CHECK (sprint_status IN ('Planned', 'Active', 'Completed', 'Cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sprints_project ON public.sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(sprint_status);

-- ==============================================================================
-- TABLE: tasks (Phase 4 Extended)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_status TEXT NOT NULL DEFAULT 'To Do' CHECK (task_status IN ('Backlog', 'To Do', 'In Progress', 'In Review', 'Blocked', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    actual_hours NUMERIC(6, 2) NOT NULL DEFAULT 0,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON public.tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- ==============================================================================
-- TABLE: task_assignees (Phase 4)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    team_member_id TEXT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(task_id, team_member_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task ON public.task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_member ON public.task_assignees(team_member_id);

-- ==============================================================================
-- TABLE: invoices (Phase 6 Full Specification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    invoice_title TEXT NOT NULL,
    description TEXT,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('Advance', 'Milestone', 'Final Payment', 'Full Payment', 'Maintenance', 'Other')),
    invoice_status TEXT NOT NULL DEFAULT 'Draft' CHECK (invoice_status IN ('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    amount_due NUMERIC NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(invoice_status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date);

-- ==============================================================================
-- TABLE: invoice_items (Phase 6)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    total NUMERIC NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ==============================================================================
-- TABLE: payments (Phase 6 Full Specification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method IN ('Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Debit Card', 'Other')),
    transaction_reference TEXT,
    payment_status TEXT NOT NULL DEFAULT 'Completed' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- ==============================================================================
-- TABLE: expense_categories (Phase 7)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE: expenses (Phase 7 Full Specification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
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

-- ==============================================================================
-- TABLE: activity_logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
-- ==============================================================================
-- TABLE: leads (Phase 8 - Sales CRM)
-- ==============================================================================
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

-- ==============================================================================
-- TABLE: lead_activities (Phase 8)
-- ==============================================================================
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

-- ==============================================================================
-- TABLE: lead_followups (Phase 8)
-- ==============================================================================
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

-- ==============================================================================
-- TABLE: notifications (Phase 9)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT,
    notification_type TEXT NOT NULL CHECK (
        notification_type IN (
            'Task Assigned', 'Task Updated', 'Task Deadline',
            'Project Assigned', 'Project Updated', 'Project Deadline',
            'New Lead', 'Lead Assigned', 'Lead Follow Up', 'Lead Converted',
            'Invoice Created', 'Invoice Overdue', 'Payment Received',
            'Expense Due', 'Expense Overdue', 'Team Workload', 'System Alert', 'General'
        )
    ),
    entity_type TEXT CHECK (
        entity_type IN ('client', 'project', 'task', 'invoice', 'payment', 'expense', 'lead', 'team_member', 'sprint', 'system')
    ),
    entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ==============================================================================
-- TABLE: notification_preferences (Phase 9)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_assigned BOOLEAN NOT NULL DEFAULT TRUE,
    task_status_changes BOOLEAN NOT NULL DEFAULT TRUE,
    task_deadlines BOOLEAN NOT NULL DEFAULT TRUE,
    project_assignments BOOLEAN NOT NULL DEFAULT TRUE,
    project_deadlines BOOLEAN NOT NULL DEFAULT TRUE,
    lead_assignments BOOLEAN NOT NULL DEFAULT TRUE,
    lead_followups BOOLEAN NOT NULL DEFAULT TRUE,
    lead_updates BOOLEAN NOT NULL DEFAULT TRUE,
    invoice_updates BOOLEAN NOT NULL DEFAULT TRUE,
    invoice_overdue BOOLEAN NOT NULL DEFAULT TRUE,
    payment_received BOOLEAN NOT NULL DEFAULT TRUE,
    expense_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    team_workload_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    system_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE: business_alerts (Phase 9)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.business_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (
        alert_type IN (
            'Overdue Task', 'Task Due Today', 'Project Overdue', 'Project Due Soon',
            'Invoice Overdue', 'Invoice Due Soon', 'Expense Overdue', 'Expense Due Soon',
            'Lead Follow Up Overdue', 'Lead Follow Up Today', 'Team Overloaded', 'Project At Risk'
        )
    ),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'Warning' CHECK (severity IN ('Info', 'Warning', 'Critical')),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_business_alerts_type ON public.business_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_business_alerts_severity ON public.business_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_business_alerts_is_resolved ON public.business_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_business_alerts_entity ON public.business_alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_business_alerts_created_at ON public.business_alerts(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on team members" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow admin delete on clients" ON public.clients FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);

CREATE POLICY "Allow authenticated read on projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage on sprints" ON public.sprints FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow admin delete on invoices" ON public.invoices FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);
CREATE POLICY "Allow authenticated manage on invoice items" ON public.invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow admin delete on leads" ON public.leads FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);
CREATE POLICY "Allow authenticated manage on lead activities" ON public.lead_activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage on lead followups" ON public.lead_followups FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on skills" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin manage on skills" ON public.skills FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager'))
);
CREATE POLICY "Allow authenticated manage on team member skills" ON public.team_member_skills FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage on notifications" ON public.notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage on notification preferences" ON public.notification_preferences FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage on business alerts" ON public.business_alerts FOR ALL TO authenticated USING (true);

-- Seed Initial Founders
INSERT INTO public.team_members (employee_code, full_name, name, email, role, department, designation, title, is_founder)
VALUES
  ('UXI-EMP-001', 'T. Ranjith Kumar', 'Ranjith', 'ranjith@uxitech.in', 'Admin', 'Leadership', 'Founder & CEO', 'Founder & Chief Executive Officer', true),
  ('UXI-EMP-002', 'Mohammed Hafi', 'Hafi', 'hafi@uxitech.in', 'Admin', 'Engineering', 'Co-Founder & CTO', 'Co-Founder & Chief Technology Officer', true),
  ('UXI-EMP-003', 'Vedesh Kumar', 'Vedesh', 'vedesh@uxitech.in', 'Admin', 'Product & Design', 'Co-Founder & CPO', 'Co-Founder & Head of Product & Design', true),
  ('UXI-EMP-004', 'Praneeth Reddy', 'Praneeth', 'praneeth@uxitech.in', 'Admin', 'Engineering', 'Co-Founder & Lead Dev', 'Co-Founder & Lead Software Engineer', true)
ON CONFLICT (email) DO NOTHING;
