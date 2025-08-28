
-- Create RPC function for radiogroup dimension comparison
CREATE OR REPLACE FUNCTION public.get_dimension_radiogroup(
  p_campaign_id uuid, 
  p_instance_id uuid, 
  p_question_name text, 
  p_dimension text
)
RETURNS TABLE(
  dimension text, 
  choice_data jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH supervisor_filter AS (
    SELECT
      CONCAT(sup.first_name, ' ', sup.last_name) AS supervisor_name
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    LEFT JOIN profiles sup ON sup.id = sr.primary_supervisor_id
    WHERE sa.campaign_id = p_campaign_id
      AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
      AND sr.status = 'submitted'
      AND sr.response_data ? p_question_name
      AND p_dimension = 'supervisor'
    GROUP BY supervisor_name
    HAVING COUNT(*) >= 4
  ),
  survey_choices AS (
    SELECT 
      jsonb_array_elements(
        jsonb_path_query_array(
          s.json_data, 
          '$.pages[*].elements[*] ? (@.name == $name).choices[*]', 
          jsonb_build_object('name', p_question_name)
        )
      ) AS choice
    FROM survey_campaigns sc
    JOIN surveys s ON s.id = sc.survey_id
    WHERE sc.id = p_campaign_id
  ),
  response_stats AS (
    SELECT 
      CASE p_dimension
        WHEN 'supervisor' THEN CONCAT(sup.first_name, ' ', sup.last_name)
        WHEN 'sbu' THEN s.name
        WHEN 'location' THEN loc.name
        WHEN 'employment_type' THEN et.name
        WHEN 'employee_type' THEN ety.name
        WHEN 'employee_role' THEN er.name
        WHEN 'level' THEN l.name
        WHEN 'gender' THEN 
          CASE 
            WHEN sr.gender IS NULL THEN 'Not Specified'
            ELSE sr.gender::text
          END
        WHEN 'generation' THEN 
          CASE 
            WHEN sr.generation IS NULL THEN 'Not Specified'
            ELSE sr.generation
          END
        ELSE 'Unknown'
      END AS dimension_value,
      sr.response_data->>p_question_name AS selected_choice
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    LEFT JOIN profiles sup ON sup.id = sr.primary_supervisor_id
    LEFT JOIN sbus s ON s.id = sr.primary_sbu_id
    LEFT JOIN locations loc ON loc.id = sr.location_id
    LEFT JOIN employment_types et ON et.id = sr.employment_type_id
    LEFT JOIN employee_types ety ON ety.id = sr.employee_type_id
    LEFT JOIN employee_roles er ON er.id = sr.employee_role_id
    LEFT JOIN levels l ON l.id = sr.level_id
    WHERE sa.campaign_id = p_campaign_id
      AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
      AND sr.status = 'submitted'
      AND sr.response_data ? p_question_name
      AND (
        p_dimension != 'supervisor'
        OR CONCAT(sup.first_name, ' ', sup.last_name) IN (SELECT supervisor_name FROM supervisor_filter)
      )
  ),
  dimension_choice_stats AS (
    SELECT
      rs.dimension_value,
      sc.choice->>'value' AS choice_value,
      sc.choice->>'text' AS choice_text,
      COUNT(rs.selected_choice) FILTER (WHERE rs.selected_choice = sc.choice->>'value') AS choice_count,
      COUNT(rs.selected_choice) AS total_responses
    FROM response_stats rs
    CROSS JOIN survey_choices sc
    WHERE rs.dimension_value IS NOT NULL
    GROUP BY rs.dimension_value, sc.choice->>'value', sc.choice->>'text'
  )
  SELECT 
    dcs.dimension_value AS dimension,
    jsonb_agg(
      jsonb_build_object(
        'choice_value', dcs.choice_value,
        'choice_text', dcs.choice_text,
        'count', dcs.choice_count,
        'percentage', 
        CASE 
          WHEN dcs.total_responses > 0 
          THEN ROUND((dcs.choice_count::numeric / dcs.total_responses::numeric) * 100, 1)
          ELSE 0
        END
      )
      ORDER BY dcs.choice_count DESC
    ) AS choice_data
  FROM dimension_choice_stats dcs
  GROUP BY dcs.dimension_value
  ORDER BY dcs.dimension_value;
END;
$function$
