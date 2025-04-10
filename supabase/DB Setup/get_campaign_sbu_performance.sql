
-- Function to get top performing SBUs for a campaign instance
CREATE OR REPLACE FUNCTION public.get_campaign_sbu_performance(
  p_campaign_id UUID,
  p_instance_id UUID
)
RETURNS TABLE(
  rank INTEGER,
  sbu_name TEXT,
  total_assigned INTEGER,
  total_completed INTEGER,
  avg_score NUMERIC,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Get all assignments for the campaign
  assignments AS (
    SELECT 
      sa.id as assignment_id,
      sa.user_id,
      us.sbu_id,
      s.name as sbu_name,
      CASE WHEN sr.id IS NOT NULL AND sr.status = 'submitted' THEN 1 ELSE 0 END as is_completed
    FROM survey_assignments sa
    JOIN user_sbus us ON us.user_id = sa.user_id AND us.is_primary = true
    JOIN sbus s ON s.id = us.sbu_id
    LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
                                 AND sr.campaign_instance_id = p_instance_id
                                 AND sr.status = 'submitted'
    WHERE sa.campaign_id = p_campaign_id
  ),
  -- Calculate averages for rating questions
  ratings AS (
    SELECT 
      us.sbu_id,
      AVG(
        (jsonb_path_query_array(sr.response_data, 
          '$.*? (@.type == "rating" && @.rateCount == 5)') #>> '{}')::NUMERIC
      ) as avg_rating
    FROM survey_responses sr
    JOIN survey_assignments sa ON sr.assignment_id = sa.id
    JOIN user_sbus us ON us.user_id = sa.user_id AND us.is_primary = true
    WHERE sr.campaign_instance_id = p_instance_id
    AND sr.status = 'submitted'
    GROUP BY us.sbu_id
  ),
  -- Aggregate stats by SBU
  sbu_stats AS (
    SELECT 
      a.sbu_id,
      a.sbu_name,
      COUNT(DISTINCT a.assignment_id) as total_assigned,
      SUM(a.is_completed) as total_completed,
      COALESCE(r.avg_rating, 0) as avg_score,
      CASE 
        WHEN COUNT(DISTINCT a.assignment_id) > 0 
        THEN (SUM(a.is_completed)::NUMERIC / COUNT(DISTINCT a.assignment_id)::NUMERIC) * 100
        ELSE 0
      END as completion_rate
    FROM assignments a
    LEFT JOIN ratings r ON r.sbu_id = a.sbu_id
    GROUP BY a.sbu_id, a.sbu_name, r.avg_rating
  )
  -- Rank SBUs by average score
  SELECT 
    ROW_NUMBER() OVER (ORDER BY avg_score DESC) as rank,
    sbu_name,
    total_assigned,
    total_completed,
    avg_score,
    completion_rate
  FROM sbu_stats
  WHERE total_assigned > 0
  ORDER BY avg_score DESC, total_completed DESC
  LIMIT 10;
END;
$$;

COMMENT ON FUNCTION public.get_campaign_sbu_performance IS 'Returns performance metrics for top SBUs in a campaign instance, ranked by average rating score';
