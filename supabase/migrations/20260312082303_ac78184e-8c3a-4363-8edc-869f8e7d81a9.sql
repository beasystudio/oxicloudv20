CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  btw_number text NOT NULL UNIQUE,
  company_name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  company_address text,
  company_website text,
  bank_account text,
  kbo_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_login_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workspace"
  ON public.workspaces FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspace"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_members.workspace_id AND owner_id = auth.uid())
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_members.workspace_id AND owner_id = auth.uid())
  );

CREATE TRIGGER handle_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.check_btw_available(btw text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.workspaces WHERE btw_number = btw
  )
$$