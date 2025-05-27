
CREATE OR REPLACE FUNCTION public.get_supervisor_team_feedback(p_campaign_id uuid, p_instance_id uuid, p_supervisor_id uuid, p_question_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_team_members UUID[];
  v_response_count INTEGER;
  v_result JSON;
  v_min_responses_required INTEGER := 4;
BEGIN
  -- First, get the list of team members supervised by this person
  SELECT array_agg(us.user_id)
  INTO v_team_members
  FROM user_supervisors us
  WHERE us.supervisor_id = p_supervisor_id
    AND us.user_id IS NOT NULL;
  
  -- If no team members found, return empty result
  IF v_team_members IS NULL OR array_length(v_team_members, 1) = 0 THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'No team members found for this supervisor',
      'data', json_build_object(
        'questions', '[]'::json,
        'aggregated_data', '{}'::json,
        'team_size', 0
      )
    );
  END IF;
  
  -- Check response count for this instance and campaign
  SELECT COUNT(DISTINCT sr.user_id)
  INTO v_response_count
  FROM survey_responses sr
  JOIN survey_assignments sa ON sr.assignment_id = sa.id
  WHERE sr.campaign_instance_id = p_instance_id
  AND sa.campaign_id = p_campaign_id
  AND sr.user_id = ANY(v_team_members)
  AND sr.status = 'submitted';
  
  -- If not enough responses, return error
  IF v_response_count < v_min_responses_required THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Insufficient responses. Minimum ' || v_min_responses_required || ' responses required for data access.',
      'data', json_build_object(
        'questions', '[]'::json,
        'response_count', v_response_count,
        'team_size', array_length(v_team_members, 1),
        'min_required', v_min_responses_required
      )
    );
  END IF;
  
  -- If a specific question is requested
  IF p_question_name IS NOT NULL THEN
    WITH question_data AS (
      -- Get the question details from the survey
      SELECT
        q->>'name' AS question_name,
        q->>'title' AS question_title,
        q->>'type' AS question_type,
        COALESCE((q->>'rateMin')::integer, 1) AS rate_min,
        COALESCE((q->>'rateMax')::integer, 5) AS rate_max
      FROM survey_campaigns sc
      JOIN surveys s ON s.id = sc.survey_id,
      jsonb_array_elements(s.json_data->'pages') AS page,
      jsonb_array_elements(page->'elements') AS q
      WHERE sc.id = p_campaign_id
      AND q->>'name' = p_question_name
      LIMIT 1
    ),
    responses AS (
      -- Get responses from team members
      SELECT 
        sr.user_id,
        sr.response_data->>(p_question_name) AS answer_value,
        sr.submitted_at
      FROM survey_responses sr
      JOIN survey_assignments sa ON sr.assignment_id = sa.id
      WHERE sr.campaign_instance_id = p_instance_id
      AND sa.campaign_id = p_campaign_id
      AND sr.user_id = ANY(v_team_members)
      AND sr.status = 'submitted'
    )
    SELECT json_build_object(
      'status', 'success',
      'data', json_build_object(
        'question', (
          SELECT 
            CASE 
              WHEN qd.question_type IN ('rating', 'nps') 
              THEN json_build_object(
                'question_name', qd.question_name,
                'question_title', qd.question_title,
                'question_type', qd.question_type,
                'rate_min', qd.rate_min,
                'rate_max', qd.rate_max
              )
              ELSE json_build_object(
                'question_name', qd.question_name,
                'question_title', qd.question_title,
                'question_type', qd.question_type
              )
            END
          FROM question_data qd
        ),
        'responses', (
          SELECT json_agg(
            json_build_object(
              'user_id', r.user_id,
              'value', r.answer_value,
              'submitted_at', r.submitted_at
            )
          ) FROM responses r
        ),
        'aggregated', (
          SELECT 
            CASE 
              WHEN (SELECT question_type FROM question_data) IN ('rating', 'nps')
              THEN json_build_object(
                'response_count', COUNT(*),
                'average', AVG((answer_value)::NUMERIC),
                'rate_min', (SELECT rate_min FROM question_data),
                'rate_max', (SELECT rate_max FROM question_data),
                'distribution', (
                  SELECT json_agg(
                    json_build_object(
                      'value', value,
                      'count', count
                    )
                  )
                  FROM (
                    SELECT 
                      (answer_value)::NUMERIC AS value,
                      COUNT(*) AS count
                    FROM responses
                    WHERE answer_value ~ '^[0-9]+(\.[0-9]+)?$'
                    GROUP BY answer_value
                    ORDER BY value
                  ) AS dist
                )
              )
              WHEN (SELECT question_type FROM question_data) = 'boolean'
              THEN json_build_object(
                'response_count', COUNT(*),
                'average', NULL,
                'distribution', json_build_object(
                  'true_count', COUNT(*) FILTER(WHERE LOWER(answer_value) IN ('true', '1', 'yes')),
                  'false_count', COUNT(*) FILTER(WHERE LOWER(answer_value) IN ('false', '0', 'no'))
                )
              )
              ELSE json_build_object(
                'response_count', COUNT(*),
                'average', NULL,
                'distribution', (
                  SELECT json_agg(answer_value)
                  FROM responses
                  WHERE answer_value IS NOT NULL AND LENGTH(answer_value) > 0
                )
              )
            END
          FROM responses
        ),
        'team_size', array_length(v_team_members, 1),
        'response_rate', (
          SELECT 
            ROUND((COUNT(DISTINCT r.user_id)::NUMERIC / array_length(v_team_members, 1)) * 100, 1)
          FROM responses r
        )
      )
    ) INTO v_result;
  ELSE
    -- Return data for all questions in the survey
    WITH survey_questions AS (
      -- Get all questions from the survey
      SELECT
        q->>'name' AS question_name,
        q->>'title' AS question_title,
        q->>'type' AS question_type,
        COALESCE((q->>'rateMin')::integer, 1) AS rate_min,
        COALESCE((q->>'rateMax')::integer, 5) AS rate_max
      FROM survey_campaigns sc
      JOIN surveys s ON s.id = sc.survey_id,
      jsonb_array_elements(s.json_data->'pages') AS page,
      jsonb_array_elements(page->'elements') AS q
      WHERE sc.id = p_campaign_id
      AND q->>'name' IS NOT NULL
    ),
    team_responses AS (
      -- Get all responses from team members
      SELECT 
        sr.user_id,
        sr.response_data,
        sr.submitted_at
      FROM survey_responses sr
      JOIN survey_assignments sa ON sr.assignment_id = sa.id
      WHERE sr.campaign_instance_id = p_instance_id
      AND sa.campaign_id = p_campaign_id
      AND sr.user_id = ANY(v_team_members)
      AND sr.status = 'submitted'
    ),
    question_stats AS (
      -- Aggregate statistics for each question
      SELECT
        sq.question_name,
        sq.question_title,
        sq.question_type,
        sq.rate_min,
        sq.rate_max,
        (
          SELECT COUNT(*)
          FROM team_responses tr
          WHERE tr.response_data->>sq.question_name IS NOT NULL
        ) AS response_count,
        CASE 
          WHEN sq.question_type IN ('rating', 'nps') 
          THEN (
            SELECT AVG((tr.response_data->>sq.question_name)::NUMERIC)
            FROM team_responses tr
            WHERE tr.response_data->>sq.question_name ~ '^[0-9]+(\.[0-9]+)?$'
          )
          ELSE NULL 
        END AS avg_value,
        CASE
          WHEN sq.question_type IN ('rating', 'nps')
          THEN (
            -- Fixed distribution for rating questions - return array of value/count objects
            SELECT json_agg(
              json_build_object(
                'value', value,
                'count', count
              )
            )
            FROM (
              SELECT 
                (tr.response_data->>sq.question_name)::NUMERIC AS value,
                COUNT(*) AS count
              FROM team_responses tr
              WHERE tr.response_data->>sq.question_name ~ '^[0-9]+(\.[0-9]+)?$'
              GROUP BY (tr.response_data->>sq.question_name)::NUMERIC
              ORDER BY value
            ) AS rating_dist
          )
          WHEN sq.question_type = 'boolean'
          THEN (
            SELECT json_build_object(
              'true_count', COUNT(*) FILTER(WHERE LOWER(tr.response_data->>sq.question_name) IN ('true', '1', 'yes')),
              'false_count', COUNT(*) FILTER(WHERE LOWER(tr.response_data->>sq.question_name) IN ('false', '0', 'no'))
            )
            FROM team_responses tr
            WHERE tr.response_data->>sq.question_name IS NOT NULL
          )
          WHEN sq.question_type IN ('text', 'comment')
          THEN (
            SELECT json_agg(tr.response_data->>sq.question_name)
            FROM team_responses tr
            WHERE tr.response_data->>sq.question_name IS NOT NULL 
              AND LENGTH(tr.response_data->>sq.question_name) > 0
          )
          ELSE NULL
        END AS distribution
      FROM survey_questions sq
    )
    SELECT json_build_object(
      'status', 'success',
      'data', json_build_object(
        'questions', (
          SELECT json_agg(
            CASE 
              WHEN qs.question_type IN ('rating', 'nps')
              THEN json_build_object(
                'question_name', qs.question_name,
                'question_title', qs.question_title,
                'question_type', qs.question_type,
                'response_count', qs.response_count,
                'avg_value', qs.avg_value,
                'distribution', qs.distribution,
                'rate_min', qs.rate_min,
                'rate_max', qs.rate_max
              )
              ELSE json_build_object(
                'question_name', qs.question_name,
                'question_title', qs.question_title,
                'question_type', qs.question_type,
                'response_count', qs.response_count,
                'avg_value', qs.avg_value,
                'distribution', qs.distribution
              )
            END
          )
          FROM question_stats qs
        ),
        'team_size', array_length(v_team_members, 1),
        'response_count', (SELECT COUNT(*) FROM team_responses),
        'response_rate', (
          SELECT 
            ROUND((COUNT(DISTINCT tr.user_id)::NUMERIC / array_length(v_team_members, 1)) * 100, 1)
          FROM team_responses tr
        ),
        'campaign_info', (
          SELECT json_build_object(
            'campaign_id', sc.id,
            'campaign_name', sc.name,
            'instance_id', ci.id,
            'period_number', ci.period_number,
            'starts_at', ci.starts_at,
            'ends_at', ci.ends_at
          )
          FROM survey_campaigns sc
          JOIN campaign_instances ci ON ci.campaign_id = sc.id
          WHERE sc.id = p_campaign_id AND ci.id = p_instance_id
        )
      )
    ) INTO v_result;
  END IF;

  RETURN v_result;
END;
$function$
