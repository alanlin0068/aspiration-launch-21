-- Add website_url column to charities table
ALTER TABLE public.charities ADD COLUMN website_url text;

-- Update charities with their official website URLs
UPDATE public.charities SET website_url = 'https://www.againstmalaria.com' WHERE name = 'Against Malaria Foundation';
UPDATE public.charities SET website_url = 'https://www.givedirectly.org' WHERE name = 'GiveDirectly';
UPDATE public.charities SET website_url = 'https://www.hki.org' WHERE name = 'Helen Keller International';
UPDATE public.charities SET website_url = 'https://thehumaneleague.org' WHERE name = 'The Humane League';

-- Create a function to get public aggregate stats (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE (
  active_users bigint,
  total_donated numeric,
  charities_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM profiles) as active_users,
    (SELECT COALESCE(SUM(amount), 0) FROM donations) as total_donated,
    (SELECT COUNT(*) FROM charities) as charities_count;
$$;