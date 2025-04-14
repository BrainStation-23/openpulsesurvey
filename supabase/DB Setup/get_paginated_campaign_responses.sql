
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_paginated_campaign_responses;

-- Create the updated function with primary supervisor and SBU information
CREATE OR REPLACE FUNCTION public.get_paginated_campaign_responses(
  p_campaign_id UUID,
  p_instance_id UUID,
  p_search_term TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10,
  p_sort_by TEXT DEFAULT 'date',
  p_sort_direction TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  id UUID,
  assignment_id UUID,
  user_id UUID,
  campaign_instance_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  status TEXT,
  response_data JSONB,
  state_data JSONB,
  total_count BIGINT,
  campaign_anonymous BOOLEAN,
  -- New columns
  primary_sbu_name TEXT,
  primary_supervisor_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER := (p_page - 1) * p_page_size;
  v_sort_sql TEXT;
  v_campaign_anonymous BOOLEAN;
BEGIN
  -- Get campaign anonymity setting - Fix the ambiguous reference by qualifying the id column
  SELECT sc.anonymous INTO v_campaign_anonymous
  FROM survey_campaigns sc
  WHERE sc.id = p_campaign_id;
  
  -- Set up sorting SQL
  IF p_sort_by = 'date' THEN
    v_sort_sql := 'sr.submitted_at ' || p_sort_direction;
  ELSIF p_sort_by = 'name' THEN
    v_sort_sql := 'CONCAT(p.first_name, '' '', p.last_name) ' || p_sort_direction;
  ELSE
    -- Default to date sorting
    v_sort_sql := 'sr.submitted_at ' || p_sort_direction;
  END IF;

  RETURN QUERY
  SELECT 
    sr.id,
    sr.assignment_id,
    sr.user_id,
    sr.campaign_instance_id,
    sr.created_at,
    sr.updated_at,
    sr.submitted_at,
    sr.status::TEXT, -- Cast enum to text
    sr.response_data,
    sr.state_data,
    COUNT(*) OVER() AS total_count,
    v_campaign_anonymous, -- Return campaign anonymity setting
    -- Get primary SBU name (if any)
    (
      SELECT s.name
      FROM user_sbus us
      JOIN sbus s ON s.id = us.sbu_id
      WHERE us.user_id = sr.user_id AND us.is_primary = true
      LIMIT 1
    ) AS primary_sbu_name,
    -- Get primary supervisor name (if any)
    (
      SELECT CONCAT(sup.first_name, ' ', sup.last_name)
      FROM user_supervisors usup
      JOIN profiles sup ON sup.id = usup.supervisor_id
      WHERE usup.user_id = sr.user_id AND usup.is_primary = true
      LIMIT 1
    ) AS primary_supervisor_name
  FROM survey_responses sr
  JOIN survey_assignments sa ON sr.assignment_id = sa.id
  JOIN profiles p ON p.id = sr.user_id
  WHERE sa.campaign_id = p_campaign_id
  AND sr.campaign_instance_id = p_instance_id
  AND (
    p_search_term IS NULL
    OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) LIKE '%' || LOWER(p_search_term) || '%'
  )
  ORDER BY (CASE WHEN v_sort_sql = 'sr.submitted_at desc' THEN sr.submitted_at END) DESC,
           (CASE WHEN v_sort_sql = 'sr.submitted_at asc' THEN sr.submitted_at END) ASC,
           (CASE WHEN v_sort_sql = 'CONCAT(p.first_name, '' '', p.last_name) desc' THEN CONCAT(p.first_name, ' ', p.last_name) END) DESC,
           (CASE WHEN v_sort_sql = 'CONCAT(p.first_name, '' '', p.last_name) asc' THEN CONCAT(p.first_name, ' ', p.last_name) END) ASC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$$;

-- Add a comment to describe the function
COMMENT ON FUNCTION public.get_paginated_campaign_responses IS 'Returns paginated and filtered survey responses for a specific campaign instance with primary SBU and supervisor information';
