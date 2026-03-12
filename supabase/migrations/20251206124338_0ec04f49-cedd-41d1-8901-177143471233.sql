-- First add client_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_admin';

-- Create enum for quote status
CREATE TYPE public.quote_status AS ENUM ('pending', 'sent', 'paid', 'expired', 'cancelled');

-- Create enum for commission status
CREATE TYPE public.commission_status AS ENUM ('pending_invoice', 'invoice_received', 'paid', 'disputed');

-- Create enum for audit event type
CREATE TYPE public.audit_event_type AS ENUM (
  'quote_created', 'quote_sent', 'quote_paid', 'quote_expired', 'quote_cancelled',
  'calculation_unlocked', 'commission_email_sent', 'invoice_received', 'commission_paid',
  'payment_webhook_received'
);

-- Company billing info table (fixed billing details per company)
CREATE TABLE public.company_billing_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  vat_number TEXT,
  peppol_id TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform settings table (for commission percentage etc)
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id TEXT NOT NULL,
  client_contact_name TEXT NOT NULL,
  client_contact_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status quote_status NOT NULL DEFAULT 'pending',
  valid_until TIMESTAMPTZ NOT NULL,
  payment_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table (tracks successful payments)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id),
  transaction_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_provider TEXT DEFAULT 'mock',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commissions table
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id),
  company_id TEXT NOT NULL,
  quote_id UUID NOT NULL REFERENCES public.quotes(id),
  commission_percentage DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status commission_status NOT NULL DEFAULT 'pending_invoice',
  email_sent_at TIMESTAMPTZ,
  invoice_received_at TIMESTAMPTZ,
  invoice_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE public.payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type audit_event_type NOT NULL,
  quote_id UUID REFERENCES public.quotes(id),
  payment_id UUID REFERENCES public.payments(id),
  commission_id UUID REFERENCES public.commissions(id),
  user_id UUID REFERENCES auth.users(id),
  company_id TEXT,
  event_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.company_billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_billing_info
CREATE POLICY "Owners and admins can manage billing info"
ON public.company_billing_info FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Client owners can view their company billing info"
ON public.company_billing_info FOR SELECT
USING (has_role(auth.uid(), 'client_owner'));

-- RLS Policies for platform_settings
CREATE POLICY "Owners and admins can manage platform settings"
ON public.platform_settings FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view platform settings"
ON public.platform_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for quotes
CREATE POLICY "Users can view their own quotes"
ON public.quotes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create quotes"
ON public.quotes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quotes"
ON public.quotes FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Owners and admins can view all quotes"
ON public.quotes FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their quotes"
ON public.payments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quotes 
  WHERE quotes.id = payments.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Owners and admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for commissions
CREATE POLICY "Owners and admins can manage commissions"
ON public.commissions FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Client owners can view their company commissions"
ON public.commissions FOR SELECT
USING (has_role(auth.uid(), 'client_owner'));

-- RLS Policies for audit log
CREATE POLICY "Owners and admins can view audit log"
ON public.payment_audit_log FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own audit events"
ON public.payment_audit_log FOR SELECT
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_company_billing_info_updated_at
BEFORE UPDATE ON public.company_billing_info
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES ('commission_percentage', '{"value": 30}'::jsonb);