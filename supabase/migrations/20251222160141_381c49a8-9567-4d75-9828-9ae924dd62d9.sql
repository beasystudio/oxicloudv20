-- Add nox_status enum for project lifecycle tracking
CREATE TYPE nox_status AS ENUM (
  'input_completed',
  'price_generated', 
  'awaiting_payment',
  'paid',
  'report_in_progress',
  'report_delivered',
  'expired'
);

-- Add nox_status column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN nox_status nox_status DEFAULT 'input_completed';

-- Add invoice_url to commissions for claim tracking
ALTER TABLE public.commissions 
ADD COLUMN invoice_url text;

-- Create index for faster lookups by nox_status
CREATE INDEX idx_quotes_nox_status ON public.quotes(nox_status);

-- Create index for project_id lookups
CREATE INDEX idx_quotes_project_id ON public.quotes(project_id);