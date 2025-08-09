
-- Fix the next batch of database functions
-- Continuing with analysis and reporting functions

-- Fix get_instance_question_responses function
CREATE OR REPLACE FUNCTION public.get_instance_question_responses(
    p_campaign_id uuid,
    p_instance_id uuid
)
RETURNS TABLE(
    question_key text,
    question_title text,
    question_type text,
    response_count bigint,
    avg_score numeric,
    distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH survey_questions AS (
        SELECT
            q.value->>'name' AS question_key,
            q.value->>'title' AS question_title,
            q.value->>'type' AS question_type
        FROM public.survey_campaigns sc
        JOIN public.surveys s ON s.id = sc.survey_id,
        jsonb_array_elements(s.json_data->'pages') AS page,
        jsonb_array_elements(page->'elements') AS q
        WHERE sc.id = p_campaign_id
            AND q.value->>'name' IS NOT NULL
    ),
    question_responses AS (
        SELECT 
            sq.question_key,
            sq.question_title,
            sq.question_type,
            COUNT(*) as response_count,
            CASE 
                WHEN sq.question_type IN ('rating', 'nps') THEN
                    AVG(
                        CASE 
                            WHEN sr.response_data->>sq.question_key ~ '^[0-9]+(\.[0-9]+)?$'
                            THEN (sr.response_data->>sq.question_key)::numeric
                            ELSE NULL
                        END
                    )
                ELSE NULL
            END as avg_score,
            CASE
                WHEN sq.question_type IN ('rating', 'nps') THEN
                    jsonb_agg(
                        jsonb_build_object(
                            'value', 
                            CASE 
                                WHEN sr.response_data->>sq.question_key ~ '^[0-9]+(\.[0-9]+)?$'
                                THEN (sr.response_data->>sq.question_key)::numeric
                                ELSE NULL
                            END,
                            'count', 1
                        )
                    ) FILTER (WHERE sr.response_data->>sq.question_key IS NOT NULL)
                WHEN sq.question_type = 'boolean' THEN
                    jsonb_build_object(
                        'true_count', 
                        COUNT(*) FILTER (WHERE LOWER(sr.response_data->>sq.question_key) IN ('true', '1', 'yes')),
                        'false_count', 
                        COUNT(*) FILTER (WHERE LOWER(sr.response_data->>sq.question_key) IN ('false', '0', 'no'))
                    )
                ELSE
                    jsonb_agg(sr.response_data->>sq.question_key) 
                    FILTER (WHERE sr.response_data->>sq.question_key IS NOT NULL)
            END as distribution
        FROM survey_questions sq
        LEFT JOIN public.survey_responses sr ON (
            sr.response_data ? sq.question_key
            AND sr.campaign_instance_id = p_instance_id
            AND sr.status = 'submitted'
        )
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        WHERE sa.campaign_id = p_campaign_id
        GROUP BY sq.question_key, sq.question_title, sq.question_type
    )
    SELECT 
        qr.question_key,
        qr.question_title,
        qr.question_type,
        qr.response_count,
        ROUND(qr.avg_score, 2) as avg_score,
        qr.distribution
    FROM question_responses qr
    ORDER BY qr.question_key;
END;
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_is_admin boolean := false;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = p_user_id
            AND ur.role = 'admin'
    ) INTO v_is_admin;
    
    RETURN v_is_admin;
END;
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_has_role boolean := false;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = p_user_id
            AND ur.role::text = p_role
    ) INTO v_has_role;
    
    RETURN v_has_role;
END;
$function$;

-- Fix get_campaign_demographics function
CREATE OR REPLACE FUNCTION public.get_campaign_demographics(
    p_campaign_id uuid,
    p_instance_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_result jsonb;
BEGIN
    WITH demographics AS (
        SELECT 
            -- Gender demographics
            sr.gender,
            COUNT(*) FILTER (WHERE sr.gender IS NOT NULL) as gender_responses,
            
            -- Location demographics
            l.name as location_name,
            COUNT(*) FILTER (WHERE l.name IS NOT NULL) as location_responses,
            
            -- SBU demographics
            s.name as sbu_name,
            COUNT(*) FILTER (WHERE s.name IS NOT NULL) as sbu_responses,
            
            -- Level demographics
            lv.name as level_name,
            COUNT(*) FILTER (WHERE lv.name IS NOT NULL) as level_responses,
            
            -- Employment type demographics
            et.name as employment_type_name,
            COUNT(*) FILTER (WHERE et.name IS NOT NULL) as employment_type_responses,
            
            -- Employee type demographics
            ety.name as employee_type_name,
            COUNT(*) FILTER (WHERE ety.name IS NOT NULL) as employee_type_responses,
            
            -- Generation demographics
            sr.generation,
            COUNT(*) FILTER (WHERE sr.generation IS NOT NULL) as generation_responses
            
        FROM public.survey_responses sr
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        LEFT JOIN public.locations l ON l.id = sr.location_id
        LEFT JOIN public.sbus s ON s.id = sr.primary_sbu_id
        LEFT JOIN public.levels lv ON lv.id = sr.level_id
        LEFT JOIN public.employment_types et ON et.id = sr.employment_type_id
        LEFT JOIN public.employee_types ety ON ety.id = sr.employee_type_id
        WHERE sa.campaign_id = p_campaign_id
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
            AND sr.status = 'submitted'
        GROUP BY 
            sr.gender, l.name, s.name, lv.name, 
            et.name, ety.name, sr.generation
    )
    SELECT jsonb_build_object(
        'gender', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.gender::text, 'Not Specified'),
                    'count', d.gender_responses
                )
            )
            FROM demographics d
            WHERE d.gender_responses > 0
            GROUP BY d.gender
        ),
        'location', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.location_name, 'Not Specified'),
                    'count', d.location_responses
                )
            )
            FROM demographics d
            WHERE d.location_responses > 0
            GROUP BY d.location_name
        ),
        'sbu', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.sbu_name, 'Not Specified'),
                    'count', d.sbu_responses
                )
            )
            FROM demographics d
            WHERE d.sbu_responses > 0
            GROUP BY d.sbu_name
        ),
        'level', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.level_name, 'Not Specified'),
                    'count', d.level_responses
                )
            )
            FROM demographics d
            WHERE d.level_responses > 0
            GROUP BY d.level_name
        ),
        'employment_type', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.employment_type_name, 'Not Specified'),
                    'count', d.employment_type_responses
                )
            )
            FROM demographics d
            WHERE d.employment_type_responses > 0
            GROUP BY d.employment_type_name
        ),
        'employee_type', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.employee_type_name, 'Not Specified'),
                    'count', d.employee_type_responses
                )
            )
            FROM demographics d
            WHERE d.employee_type_responses > 0
            GROUP BY d.employee_type_name
        ),
        'generation', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', COALESCE(d.generation, 'Not Specified'),
                    'count', d.generation_responses
                )
            )
            FROM demographics d
            WHERE d.generation_responses > 0
            GROUP BY d.generation
        )
    ) INTO v_result;
    
    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$function$;

-- Fix get_response_trends function
CREATE OR REPLACE FUNCTION public.get_response_trends(
    p_campaign_id uuid,
    p_instance_id uuid DEFAULT NULL,
    p_date_range_days integer DEFAULT 30
)
RETURNS TABLE(
    response_date date,
    response_count bigint,
    unique_respondents bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sr.submitted_at::date as response_date,
        COUNT(*) as response_count,
        COUNT(DISTINCT sr.user_id) as unique_respondents
    FROM public.survey_responses sr
    JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
    WHERE sa.campaign_id = p_campaign_id
        AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
        AND sr.status = 'submitted'
        AND sr.submitted_at >= (CURRENT_DATE - (p_date_range_days || ' days')::INTERVAL)
    GROUP BY sr.submitted_at::date
    ORDER BY response_date;
END;
$function$;
