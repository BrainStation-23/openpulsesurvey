
-- Function to get comparison data for survey responses
CREATE OR REPLACE FUNCTION public.get_comparison_data(
  p_campaign_id UUID,
  p_instance_id UUID,
  p_question_name TEXT,
  p_dimension TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH response_data AS (
    SELECT 
      r.id,
      r.response_data,
      -- Extract the dimension value based on the requested dimension
      CASE 
        WHEN p_dimension = 'gender' THEN COALESCE(p.gender, 'Unknown')
        WHEN p_dimension = 'sbu' THEN (
          SELECT sbu.name 
          FROM user_sbus us 
          JOIN sbus sbu ON us.sbu_id = sbu.id 
          WHERE us.user_id = p.id AND us.is_primary = true
          LIMIT 1
        )
        WHEN p_dimension = 'location' THEN COALESCE(l.name, 'Unknown')
        WHEN p_dimension = 'employment_type' THEN COALESCE(et.name, 'Unknown')
        WHEN p_dimension = 'level' THEN COALESCE(lvl.name, 'Unknown')
        WHEN p_dimension = 'employee_type' THEN COALESCE(emp_t.name, 'Unknown')
        WHEN p_dimension = 'employee_role' THEN COALESCE(emp_r.name, 'Unknown')
        ELSE 'Unknown'
      END AS dimension_value,
      -- Extract the answer for the specific question
      r.response_data->>p_question_name AS answer,
      -- Determine if it's an NPS question (rating with 10 scale)
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM surveys s
          JOIN survey_campaigns sc ON sc.survey_id = s.id
          WHERE sc.id = p_campaign_id
          AND json_data @> '{"pages": [{"elements": [{"name": "' || p_question_name || '", "type": "rating", "rateCount": 10}]}]}'
        ) THEN true
        ELSE false
      END AS is_nps
    FROM survey_responses r
    JOIN profiles p ON p.id = r.user_id
    LEFT JOIN locations l ON l.id = p.location_id
    LEFT JOIN employment_types et ON et.id = p.employment_type_id
    LEFT JOIN levels lvl ON lvl.id = p.level_id
    LEFT JOIN employee_types emp_t ON emp_t.id = p.employee_type_id
    LEFT JOIN employee_roles emp_r ON emp_r.id = p.employee_role_id
    JOIN survey_assignments sa ON sa.id = r.assignment_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR r.campaign_instance_id = p_instance_id)
  ),
  dimension_stats AS (
    SELECT
      dimension_value,
      -- For boolean questions
      SUM(CASE WHEN answer::text = 'true' THEN 1 ELSE 0 END) AS yes_count,
      SUM(CASE WHEN answer::text = 'false' THEN 1 ELSE 0 END) AS no_count,
      -- For rating questions
      AVG(NULLIF(answer::text, '')::numeric) AS avg_rating,
      -- For NPS questions
      SUM(CASE WHEN NULLIF(answer::text, '')::numeric <= 6 THEN 1 ELSE 0 END) AS detractors,
      SUM(CASE WHEN NULLIF(answer::text, '')::numeric BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS passives,
      SUM(CASE WHEN NULLIF(answer::text, '')::numeric >= 9 THEN 1 ELSE 0 END) AS promoters,
      -- For text questions (limited functionality on DB side)
      COUNT(CASE WHEN answer IS NOT NULL AND LENGTH(answer::text) > 0 THEN 1 END) AS text_response_count,
      -- Total count and sample text responses
      COUNT(*) AS total,
      array_agg(answer) FILTER (WHERE answer IS NOT NULL AND LENGTH(answer::text) > 0) AS text_samples
    FROM response_data
    GROUP BY dimension_value
  )
  SELECT json_agg(
    json_build_object(
      'dimension', dimension_value,
      'yes_count', yes_count,
      'no_count', no_count,
      'avg_rating', avg_rating,
      'detractors', detractors,
      'passives', passives,
      'promoters', promoters,
      'text_response_count', text_response_count,
      'total', total,
      'text_samples', text_samples
    )
  )
  INTO v_result
  FROM dimension_stats;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

COMMENT ON FUNCTION public.get_comparison_data IS 'Get comparison data for survey responses by demographic dimension';
