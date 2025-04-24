
-- Function to get presentation data for export
CREATE OR REPLACE FUNCTION public.get_presentation_data_for_export(
  p_campaign_id UUID,
  p_instance_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_campaign_data JSONB;
  v_survey_data JSONB;
  v_responses_data JSONB;
  v_demographic_data JSONB;
  v_comparison_data JSONB;
BEGIN
  -- Get campaign and survey data
  SELECT 
    jsonb_build_object(
      'id', sc.id,
      'name', sc.name,
      'description', sc.description,
      'starts_at', sc.starts_at,
      'ends_at', sc.ends_at,
      'completion_rate', sc.completion_rate,
      'anonymous', sc.anonymous,
      'instance', CASE 
        WHEN p_instance_id IS NOT NULL THEN
          (SELECT jsonb_build_object(
            'id', ci.id,
            'period_number', ci.period_number,
            'starts_at', ci.starts_at,
            'ends_at', ci.ends_at,
            'status', ci.status,
            'completion_rate', ci.completion_rate
          )
          FROM campaign_instances ci
          WHERE ci.id = p_instance_id)
        ELSE NULL
      END,
      'survey', jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'description', s.description,
        'json_data', s.json_data
      )
    )
  INTO v_campaign_data
  FROM survey_campaigns sc
  JOIN surveys s ON s.id = sc.survey_id
  WHERE sc.id = p_campaign_id;

  -- Extract survey question structure
  WITH survey_questions AS (
    SELECT 
      jsonb_array_elements(pages.value->'elements') as question,
      pages.ordinality as page_index
    FROM surveys s,
    jsonb_array_elements(s.json_data->'pages') WITH ORDINALITY as pages
    WHERE s.id = (SELECT survey_id FROM survey_campaigns WHERE id = p_campaign_id)
  )
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'name', question->>'name',
        'title', question->>'title',
        'type', question->>'type',
        'rateCount', CASE
          WHEN question->>'rateMax' = '10' THEN 10
          ELSE COALESCE((question->>'rateMax')::int, 5)
        END,
        'page_index', page_index
      ) ORDER BY page_index
    )
  INTO v_survey_data
  FROM survey_questions
  WHERE question->>'type' IS NOT NULL;

  -- Process responses with demographic data
  WITH response_data AS (
    SELECT 
      sr.id,
      sr.response_data,
      sr.submitted_at,
      sr.user_id,
      p.gender,
      p.location_id,
      p.level_id,
      p.employment_type_id,
      p.employee_type_id,
      p.employee_role_id,
      p.first_name,
      p.last_name
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    JOIN profiles p ON p.id = sr.user_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
  ),
  processed_responses AS (
    SELECT
      rd.id,
      rd.response_data,
      rd.submitted_at,
      jsonb_build_object(
        'name', CONCAT(rd.first_name, ' ', rd.last_name),
        'gender', rd.gender,
        'location', (SELECT name FROM locations WHERE id = rd.location_id),
        'level', (SELECT name FROM levels WHERE id = rd.level_id),
        'employment_type', (SELECT name FROM employment_types WHERE id = rd.employment_type_id),
        'employee_type', (SELECT name FROM employee_types WHERE id = rd.employee_type_id),
        'employee_role', (SELECT name FROM employee_roles WHERE id = rd.employee_role_id),
        'sbu', (
          SELECT jsonb_build_object('id', s.id, 'name', s.name)
          FROM user_sbus us
          JOIN sbus s ON s.id = us.sbu_id
          WHERE us.user_id = rd.user_id AND us.is_primary = true
          LIMIT 1
        ),
        'supervisor', (
          SELECT jsonb_build_object('id', sup.id, 'name', CONCAT(sup.first_name, ' ', sup.last_name))
          FROM user_supervisors usup
          JOIN profiles sup ON sup.id = usup.supervisor_id
          WHERE usup.user_id = rd.user_id AND usup.is_primary = true
          LIMIT 1
        )
      ) as respondent_data
    FROM response_data rd
  )
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', pr.id,
        'respondent', pr.respondent_data,
        'submitted_at', pr.submitted_at,
        'answers', pr.response_data
      )
    )
  INTO v_responses_data
  FROM processed_responses pr;

  -- Precompute demographic distribution data
  WITH dimension_counts AS (
    SELECT 
      'gender' as dimension_type,
      p.gender as dimension_value,
      COUNT(*) as count
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    JOIN profiles p ON p.id = sr.user_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    GROUP BY p.gender
    
    UNION ALL
    
    SELECT 
      'location' as dimension_type,
      l.name as dimension_value,
      COUNT(*) as count
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    JOIN profiles p ON p.id = sr.user_id
    JOIN locations l ON l.id = p.location_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    GROUP BY l.name
    
    UNION ALL
    
    SELECT 
      'sbu' as dimension_type,
      s.name as dimension_value,
      COUNT(*) as count
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    JOIN profiles p ON p.id = sr.user_id
    JOIN user_sbus us ON us.user_id = p.id AND us.is_primary = true
    JOIN sbus s ON s.id = us.sbu_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    GROUP BY s.name
  )
  SELECT 
    jsonb_object_agg(
      dimension_type,
      jsonb_agg(
        jsonb_build_object(
          'value', dimension_value,
          'count', count
        )
      )
    )
  INTO v_demographic_data
  FROM dimension_counts;

  -- Combine all data
  RETURN jsonb_build_object(
    'campaign', v_campaign_data,
    'questions', v_survey_data,
    'responses', COALESCE(v_responses_data, '[]'::jsonb),
    'demographics', COALESCE(v_demographic_data, '{}'::jsonb)
  );
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_presentation_data_for_export IS 
'Retrieves and pre-processes survey data optimized for presentation/export functionality';
