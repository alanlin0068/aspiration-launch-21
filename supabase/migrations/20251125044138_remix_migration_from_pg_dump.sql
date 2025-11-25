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
-- Dumped by pg_dump version 17.7

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
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name'
  );
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: charities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.charities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    overview text,
    cost_effectiveness text,
    evidence_of_impact text,
    image_url text
);


--
-- Name: donations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    charity_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT donations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT donations_type_check CHECK ((type = ANY (ARRAY['one-time'::text, 'round-up'::text])))
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    round_up_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    first_name text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_charity_selections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_charity_selections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    charity_id uuid NOT NULL,
    selected_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: charities charities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charities
    ADD CONSTRAINT charities_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: user_charity_selections user_charity_selections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_charity_selections
    ADD CONSTRAINT user_charity_selections_pkey PRIMARY KEY (id);


--
-- Name: user_charity_selections user_charity_selections_user_id_charity_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_charity_selections
    ADD CONSTRAINT user_charity_selections_user_id_charity_id_key UNIQUE (user_id, charity_id);


--
-- Name: donations donations_charity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_charity_id_fkey FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE CASCADE;


--
-- Name: donations donations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_charity_selections user_charity_selections_charity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_charity_selections
    ADD CONSTRAINT user_charity_selections_charity_id_fkey FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE CASCADE;


--
-- Name: user_charity_selections user_charity_selections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_charity_selections
    ADD CONSTRAINT user_charity_selections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: charities Anyone can view charities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT USING (true);


--
-- Name: user_charity_selections Users can delete their own selections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own selections" ON public.user_charity_selections FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: donations Users can insert their own donations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own donations" ON public.donations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: payment_methods Users can insert their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_charity_selections Users can insert their own selections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own selections" ON public.user_charity_selections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: payment_methods Users can update their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: donations Users can view their own donations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own donations" ON public.donations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: payment_methods Users can view their own payment methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_charity_selections Users can view their own selections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own selections" ON public.user_charity_selections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: charities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

--
-- Name: donations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_charity_selections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_charity_selections ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


