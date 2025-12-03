-- Update get_public_stats to count distinct users from donations table instead of profiles
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
    (SELECT COUNT(DISTINCT user_id) FROM donations) as active_users,
    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'completed') as total_donated,
    (SELECT COUNT(*) FROM charities) as charities_count;
$$;