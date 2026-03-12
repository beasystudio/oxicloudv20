CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'owner',
    'admin',
    'client_owner',
    'client_user'
);


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(_user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'client_owner' THEN 3
      WHEN 'client_user' THEN 4
    END
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'full_name',
      new.email
    )
  );
  RETURN new;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    firm_name text NOT NULL,
    contact_person text NOT NULL,
    phone text,
    mobile text,
    email text,
    contact_type text NOT NULL,
    address text,
    correspondence_notes text,
    company_info text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT project_contacts_contact_type_check CHECK ((contact_type = ANY (ARRAY['Client'::text, 'Team'::text, 'External Team'::text, 'Contractor'::text, 'Others'::text])))
);


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    phase_name text NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_number text NOT NULL,
    name text NOT NULL,
    status text NOT NULL,
    office text,
    code text,
    client_contact text,
    project_type text,
    overview text,
    address text,
    lat double precision,
    lng double precision,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: project_contacts project_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_contacts
    ADD CONSTRAINT project_contacts_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: profiles on_profile_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: project_contacts on_project_contacts_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_project_contacts_updated BEFORE UPDATE ON public.project_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: project_tasks on_project_tasks_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_project_tasks_updated BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: projects on_projects_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: project_contacts project_contacts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_contacts
    ADD CONSTRAINT project_contacts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tasks project_tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Owners and admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Owners and admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Owners and admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Owners and admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Owners and admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: project_contacts Users can create contacts for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create contacts for their projects" ON public.project_contacts FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_contacts.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_tasks Users can create tasks for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tasks for their projects" ON public.project_tasks FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_tasks.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: projects Users can create their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: project_contacts Users can delete contacts for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete contacts for their projects" ON public.project_contacts FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_contacts.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_tasks Users can delete tasks for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete tasks for their projects" ON public.project_tasks FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_tasks.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: projects Users can delete their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: project_contacts Users can update contacts for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update contacts for their projects" ON public.project_contacts FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_contacts.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_tasks Users can update tasks for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update tasks for their projects" ON public.project_tasks FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_tasks.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: projects Users can update their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: project_contacts Users can view contacts for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view contacts for their projects" ON public.project_contacts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_contacts.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: project_tasks Users can view tasks for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view tasks for their projects" ON public.project_tasks FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_tasks.project_id) AND (projects.user_id = auth.uid())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: projects Users can view their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: project_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: project_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


