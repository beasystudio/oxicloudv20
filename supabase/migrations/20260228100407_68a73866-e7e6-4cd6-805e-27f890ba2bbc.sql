
-- Add version tracking columns to nox_project_data
ALTER TABLE public.nox_project_data 
ADD COLUMN IF NOT EXISTS current_version text NOT NULL DEFAULT 'v0',
ADD COLUMN IF NOT EXISTS version_history jsonb NOT NULL DEFAULT '[]'::jsonb;
