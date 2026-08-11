-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'team_member', 'customer')) NOT NULL DEFAULT 'team_member',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  dakshina_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 45,
  mode TEXT CHECK (mode IN ('online', 'offline', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. STAGE CHECKLISTS
CREATE TABLE IF NOT EXISTS public.stage_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL UNIQUE,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stage_checklists ENABLE ROW LEVEL SECURITY;

-- 4. LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic Info
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  -- Lead Details
  lead_source TEXT CHECK (lead_source IN ('instagram','facebook','website','whatsapp','google_ads','meta_ads','referral','call','youtube','other')) DEFAULT 'website',
  lead_temperature TEXT CHECK (lead_temperature IN ('hot','warm','cold')) DEFAULT 'warm',
  service_interest TEXT CHECK (service_interest IN (
    'divine_consultation',
    'marriage_compatibility',
    'vastu_alignment',
    'baby_name_suggestion',
    'business_name_consultation',
    'corporate_family_mentorship',
    'baby_birth_date_selection',
    'garbh_sanskar',
    'group_consultation',
    'spiritual_mentorship',
    'other'
  )) DEFAULT 'divine_consultation',
  consultation_mode TEXT CHECK (consultation_mode IN ('online','offline')) DEFAULT 'online',
  -- Pipeline Stage
  stage TEXT CHECK (stage IN (
    'new_lead',
    'form_filled',
    'qualified_hot',
    'qualified_warm',
    'payment_received',
    'slot_confirmed',
    'pre_consult_done',
    'consultation_done',
    'remedy_sent',
    'puja_booked',
    'puja_completed',
    'stone_delivered',
    'won_testimonial',
    'lost_nurture'
  )) DEFAULT 'new_lead',
  -- Assignment
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  -- Dates
  date_of_consultation TIMESTAMPTZ,
  rescheduled BOOLEAN DEFAULT false,
  reschedule_count INT DEFAULT 0,
  -- Payment Fields
  payment_status TEXT CHECK (payment_status IN ('unpaid','token_paid','full_paid')) DEFAULT 'unpaid',
  payment_mode TEXT CHECK (payment_mode IN ('cash','online','partial')),
  token_amount NUMERIC(10,2) DEFAULT 0,
  full_amount NUMERIC(10,2) DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  amount_due NUMERIC(10,2) GENERATED ALWAYS AS (full_amount - amount_paid) STORED,
  -- Process Flags
  protocol_message_sent BOOLEAN DEFAULT false,
  pre_consult_5day_done BOOLEAN DEFAULT false,
  pre_consult_3day_done BOOLEAN DEFAULT false,
  -- Post Consultation
  conclusion_notes TEXT,
  remedy_status TEXT CHECK (remedy_status IN ('not_sent','sent','accepted','declined')) DEFAULT 'not_sent',
  puja_status TEXT CHECK (puja_status IN ('not_booked','booked','in_progress','completed')) DEFAULT 'not_booked',
  -- Gemstone / Remedy Item
  stone_status TEXT CHECK (stone_status IN ('not_decided','ordered','dispatched','delivered')) DEFAULT 'not_decided',
  stone_certificate_no TEXT,
  courier_tracking_no TEXT,
  -- Closing
  testimonial_status TEXT CHECK (testimonial_status IN ('not_collected','collected','published')) DEFAULT 'not_collected',
  -- Internal Meta
  internal_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_converted BOOLEAN DEFAULT false,
  converted_customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. LEAD CHECKLIST PROGRESS
CREATE TABLE IF NOT EXISTS public.lead_checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_lead_stage_checklist UNIQUE(lead_id, stage)
);

ALTER TABLE public.lead_checklist_progress ENABLE ROW LEVEL SECURITY;

-- 6. LEAD ACTIVITIES (Chatter)
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN (
    'note','call_log','stage_change','payment_update',
    'reminder_sent','whatsapp_sent','email_sent',
    'file_uploaded','checklist_update','system'
  )) NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  is_internal BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('token','full','partial','refund')) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash','upi','bank_transfer','card','other')) NOT NULL DEFAULT 'upi',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_no TEXT,
  receipt_url TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 8. REMINDERS
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN (
    'pre_consult_15day',
    'pre_consult_5day',
    'pre_consult_3day',
    'pre_consult_1day',
    'payment_due',
    'follow_up',
    'puja_prep',
    'stone_followup',
    'testimonial',
    'custom'
  )) NOT NULL DEFAULT 'custom',
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel TEXT CHECK (channel IN ('whatsapp','email','sms','manual_call')) DEFAULT 'manual_call',
  status TEXT CHECK (status IN ('pending','sent','done','skipped','failed')) DEFAULT 'pending',
  message_template TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 9. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_since DATE DEFAULT CURRENT_DATE,
  total_spent NUMERIC(10,2) DEFAULT 0,
  total_sessions INT DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 10. CONSULTATION TIMELINE (Client Facing)
CREATE TABLE IF NOT EXISTS public.consultation_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  consultation_date DATE,
  mode TEXT,
  summary TEXT,
  remedy_shared TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.consultation_timeline ENABLE ROW LEVEL SECURITY;

-- 11. TEAM ACTIVITY LOGS (Audit log)
CREATE TABLE IF NOT EXISTS public.team_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Helper function to fetch current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Users policies
CREATE POLICY "Super admin and admin full control on users"
  ON public.users FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Everyone authenticated can read active services"
  ON public.services FOR SELECT
  USING (is_active = true OR get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Super admin can manage services"
  ON public.services FOR ALL
  USING (get_current_user_role() = 'super_admin');

-- Stage Checklists policies
CREATE POLICY "Staff can read stage checklists"
  ON public.stage_checklists FOR SELECT
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

CREATE POLICY "Super admin can manage stage checklists"
  ON public.stage_checklists FOR ALL
  USING (get_current_user_role() = 'super_admin');

-- Leads policies
CREATE POLICY "Super admin and admin full access to leads"
  ON public.leads FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Team members access assigned leads"
  ON public.leads FOR ALL
  USING (
    get_current_user_role() = 'team_member' 
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "Allow public inserting new leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- Lead Activities policies
CREATE POLICY "Staff access to lead activities"
  ON public.lead_activities FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

-- Payments policies
CREATE POLICY "Super admin and admin full access to payments"
  ON public.payments FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Customers view own payments"
  ON public.payments FOR SELECT
  USING (customer_id = auth.uid());

-- Reminders policies
CREATE POLICY "Staff access to reminders"
  ON public.reminders FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

-- Lead Checklist Progress policies
CREATE POLICY "Staff access to checklist progress"
  ON public.lead_checklist_progress FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

-- Customers policies
CREATE POLICY "Staff access to customers"
  ON public.customers FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

CREATE POLICY "Customer can view own customer record"
  ON public.customers FOR SELECT
  USING (auth.uid() = id);

-- Consultation Timeline policies
CREATE POLICY "Staff manage timeline"
  ON public.consultation_timeline FOR ALL
  USING (get_current_user_role() IN ('super_admin', 'admin', 'team_member'));

CREATE POLICY "Customer view own timeline"
  ON public.consultation_timeline FOR SELECT
  USING (auth.uid() = customer_id);

-- Team Activity Logs policies
CREATE POLICY "Super admin read activity logs"
  ON public.team_activity_logs FOR SELECT
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Staff insert activity logs"
  ON public.team_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
