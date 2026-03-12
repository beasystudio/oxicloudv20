-- Create NOx project data table to track workflow state
CREATE TABLE public.nox_project_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'input_completed' CHECK (status IN ('input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered', 'expired')),
  sub_status TEXT,
  quote_sent_date TIMESTAMP WITH TIME ZONE,
  days_pending INTEGER,
  pre_estimation JSONB,
  price_data JSONB,
  payment_data JSONB,
  detailed_calculation JSONB,
  calculation_results JSONB,
  commission_amount NUMERIC,
  report_job_queued BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable Row Level Security
ALTER TABLE public.nox_project_data ENABLE ROW LEVEL SECURITY;

-- Create policies for nox_project_data
CREATE POLICY "Users can view their own nox data"
ON public.nox_project_data
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own nox data"
ON public.nox_project_data
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own nox data"
ON public.nox_project_data
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own nox data"
ON public.nox_project_data
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Owners and admins can view all nox data"
ON public.nox_project_data
FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can manage all nox data"
ON public.nox_project_data
FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_nox_project_data_updated_at
BEFORE UPDATE ON public.nox_project_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();