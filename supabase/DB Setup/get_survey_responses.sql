
-- Function to get survey responses with all necessary related data
CREATE OR REPLACE FUNCTION public.get_survey_responses(
  p_campaign_id UUID,
  p_instance_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign_data JSON;
  v_responses_data JSON;
BEGIN
  -- Get the campaign and survey data
  SELECT 
    json_build_object(
      'survey', json_build_object(
        'id', s.id,
        'name', s.name,
        'json_data', s.json_data
      )
    )
  INTO v_campaign_data
  FROM survey_campaigns sc
  JOIN surveys s ON s.id = sc.survey_id
  WHERE sc.id = p_campaign_id;

  -- Build a query for responses with user metadata
  WITH response_data AS (
    SELECT 
      r.id,
      r.response_data,
      r.submitted_at,
      json_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name,
        'email', p.email,
        'gender', p.gender,
        'location', CASE WHEN l.id IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END,
        'employment_type', CASE WHEN et.id IS NOT NULL THEN json_build_object('id', et.id, 'name', et.name) ELSE NULL END,
        'level', CASE WHEN lvl.id IS NOT NULL THEN json_build_object('id', lvl.id, 'name', lvl.name) ELSE NULL END,
        'employee_type', CASE WHEN emp_t.id IS NOT NULL THEN json_build_object('id', emp_t.id, 'name', emp_t.name) ELSE NULL END,
        'employee_role', CASE WHEN emp_r.id IS NOT NULL THEN json_build_object('id', emp_r.id, 'name', emp_r.name) ELSE NULL END,
        'user_sbus', (
          SELECT json_agg(
            json_build_object(
              'is_primary', us.is_primary,
              'sbu', json_build_object('id', sbu.id, 'name', sbu.name)
            )
          )
          FROM user_sbus us
          JOIN sbus sbu ON sbu.id = us.sbu_id
          WHERE us.user_id = p.id
        )
      ) AS user_data
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
  )
  SELECT json_agg(rd.*)
  INTO v_responses_data
  FROM response_data rd;

  -- Combine the data and return
  RETURN json_build_object(
    'campaign', v_campaign_data,
    'responses', COALESCE(v_responses_data, '[]'::json)
  );
END;
$$;

COMMENT ON FUNCTION public.get_survey_responses IS 'Get survey responses with all related demographic data for reporting';
