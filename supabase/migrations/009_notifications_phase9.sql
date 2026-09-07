-- ==============================================================================
-- PHASE 9 MIGRATION: COMMUNICATION, NOTIFICATIONS, ACTIVITY & SMART ALERT SYSTEM
-- ==============================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT,
    notification_type TEXT NOT NULL CHECK (
        notification_type IN (
            'Task Assigned',
            'Task Updated',
            'Task Deadline',
            'Project Assigned',
            'Project Updated',
            'Project Deadline',
            'New Lead',
            'Lead Assigned',
            'Lead Follow Up',
            'Lead Converted',
            'Invoice Created',
            'Invoice Overdue',
            'Payment Received',
            'Expense Due',
            'Expense Overdue',
            'Team Workload',
            'System Alert',
            'General'
        )
    ),
    entity_type TEXT CHECK (
        entity_type IN (
            'client',
            'project',
            'task',
            'invoice',
            'payment',
            'expense',
            'lead',
            'team_member',
            'sprint',
            'system'
        )
    ),
    entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (
        priority IN ('Low', 'Normal', 'High', 'Urgent')
    ),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 2. NOTIFICATION PREFERENCES TABLE
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

CREATE INDEX IF NOT EXISTS idx_notification_preferences_profile ON public.notification_preferences(profile_id);

-- Auto updated_at trigger for notification_preferences
CREATE OR REPLACE FUNCTION set_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_notification_preferences_updated_at();

-- 3. BUSINESS ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.business_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (
        alert_type IN (
            'Overdue Task',
            'Task Due Today',
            'Project Overdue',
            'Project Due Soon',
            'Invoice Overdue',
            'Invoice Due Soon',
            'Expense Overdue',
            'Expense Due Soon',
            'Lead Follow Up Overdue',
            'Lead Follow Up Today',
            'Team Overloaded',
            'Project At Risk'
        )
    ),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'Warning' CHECK (
        severity IN ('Info', 'Warning', 'Critical')
    ),
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

-- Auto updated_at trigger for business_alerts
CREATE OR REPLACE FUNCTION set_business_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_business_alerts_updated_at ON public.business_alerts;
CREATE TRIGGER trg_business_alerts_updated_at
    BEFORE UPDATE ON public.business_alerts
    FOR EACH ROW
    EXECUTE FUNCTION set_business_alerts_updated_at();

-- 4. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_alerts ENABLE ROW LEVEL SECURITY;

-- Notifications RLS: Users can only read, update (mark read), and delete their own notifications
CREATE POLICY "Users can select own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (recipient_id = auth.uid());

CREATE POLICY "Authenticated users can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Notification Preferences RLS: Users can manage their own preferences
CREATE POLICY "Users can select own preferences"
    ON public.notification_preferences FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Users can insert/update own preferences"
    ON public.notification_preferences FOR ALL
    TO authenticated
    USING (profile_id = auth.uid());

-- Business Alerts RLS: Authenticated team members can read; Admins/Managers can resolve
CREATE POLICY "Authenticated can select business alerts"
    ON public.business_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated can manage business alerts"
    ON public.business_alerts FOR ALL
    TO authenticated
    USING (true);
