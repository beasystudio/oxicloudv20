-- Add permissive policy to allow project creation for demo/testing purposes
-- This allows inserts when using mock auth system

CREATE POLICY "Allow public project creation for demo" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

-- Also add permissive SELECT policy so projects can be viewed
CREATE POLICY "Allow public project viewing for demo" 
ON public.projects 
FOR SELECT 
USING (true);

-- Add permissive UPDATE policy
CREATE POLICY "Allow public project updates for demo" 
ON public.projects 
FOR UPDATE 
USING (true);

-- Do the same for project_contacts
CREATE POLICY "Allow public contact creation for demo" 
ON public.project_contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public contact viewing for demo" 
ON public.project_contacts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public contact updates for demo" 
ON public.project_contacts 
FOR UPDATE 
USING (true);

-- Do the same for nox_project_data
CREATE POLICY "Allow public nox data creation for demo" 
ON public.nox_project_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public nox data viewing for demo" 
ON public.nox_project_data 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public nox data updates for demo" 
ON public.nox_project_data 
FOR UPDATE 
USING (true);

-- Do the same for project_tasks
CREATE POLICY "Allow public task creation for demo" 
ON public.project_tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public task viewing for demo" 
ON public.project_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public task updates for demo" 
ON public.project_tasks 
FOR UPDATE 
USING (true);