-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create charities table
CREATE TABLE public.charities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on charities
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

-- Charities are publicly readable
CREATE POLICY "Anyone can view charities"
  ON public.charities
  FOR SELECT
  USING (true);

-- Create user_charity_selections table
CREATE TABLE public.user_charity_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, charity_id)
);

-- Enable RLS on user_charity_selections
ALTER TABLE public.user_charity_selections ENABLE ROW LEVEL SECURITY;

-- User charity selection policies
CREATE POLICY "Users can view their own selections"
  ON public.user_charity_selections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own selections"
  ON public.user_charity_selections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selections"
  ON public.user_charity_selections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Insert initial charities
INSERT INTO public.charities (name, icon, description) VALUES
  ('Releaf the Planet', 'globe', 'Environmental reforestation initiatives'),
  ('Wells of Hope', 'droplets', 'Clean water access projects'),
  ('Full Plate Project', 'utensils', 'Food security programs'),
  ('Animal Ark Alliance', 'paw-print', 'Wildlife conservation efforts');

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();