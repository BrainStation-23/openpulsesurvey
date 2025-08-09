
-- Fix the next batch of database functions
-- Continuing with analysis and utility functions

-- Fix get_dimension_satisfaction function
CREATE OR REPLACE FUNCTION public.get_dimension_satisfaction(
    p_campaign_id uuid,
    p_instance_id uuid,
    p_question_name text,
    p_dimension text
)
RETURNS TABLE(
    dimension text,
    response_count bigint,
    avg_score numeric,
    satisfaction_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH supervisor_filter AS (
        SELECT
            CONCAT(sup.first_name, ' ', sup.last_name) AS supervisor_name
        FROM public.survey_responses sr
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        LEFT JOIN public.profiles sup ON sup.id = sr.primary_supervisor_id
        WHERE sa.campaign_id = p_campaign_id
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
            AND sr.status = 'submitted'
            AND sr.response_data->>p_question_name ~ '^[0-9]+$'
            AND p_dimension = 'supervisor'
        GROUP BY supervisor_name
        HAVING COUNT(*) >= 4
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
            (sr.response_data->>p_question_name)::NUMERIC AS rating_value
        FROM public.survey_responses sr
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        LEFT JOIN public.profiles sup ON sup.id = sr.primary_supervisor_id
        LEFT JOIN public.sbus s ON s.id = sr.primary_sbu_id
        LEFT JOIN public.locations loc ON loc.id = sr.location_id
        LEFT JOIN public.employment_types et ON et.id = sr.employment_type_id
        LEFT JOIN public.employee_types ety ON ety.id = sr.employee_type_id
        LEFT JOIN public.employee_roles er ON er.id = sr.employee_role_id
        LEFT JOIN public.levels l ON l.id = sr.level_id
        WHERE sa.campaign_id = p_campaign_id
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
            AND sr.status = 'submitted'
            AND sr.response_data->>p_question_name ~ '^[0-9]+$'
            AND (
                p_dimension != 'supervisor'
                OR CONCAT(sup.first_name, ' ', sup.last_name) IN (SELECT supervisor_name FROM supervisor_filter)
            )
    ),
    dimension_stats AS (
        SELECT
            dimension_value,
            COUNT(*) AS total_responses,
            ROUND(AVG(rating_value)::NUMERIC, 2) AS avg_rating_score,
            ROUND(
                (COUNT(*) FILTER (WHERE rating_value >= 4)::NUMERIC / COUNT(*)::NUMERIC) * 100,
                1
            ) AS satisfaction_percentage
        FROM response_stats
        WHERE dimension_value IS NOT NULL
        GROUP BY dimension_value
    )
    SELECT 
        dimension_value AS dimension,
        total_responses AS response_count,
        avg_rating_score AS avg_score,
        satisfaction_percentage AS satisfaction_rate
    FROM dimension_stats
    ORDER BY avg_rating_score DESC;
END;
$function$;

-- Fix get_dimension_bool function
CREATE OR REPLACE FUNCTION public.get_dimension_bool(
    p_campaign_id uuid,
    p_instance_id uuid,
    p_question_name text,
    p_dimension text
)
RETURNS TABLE(
    dimension text,
    response_count bigint,
    yes_count bigint,
    no_count bigint,
    yes_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH supervisor_filter AS (
        SELECT
            CONCAT(sup.first_name, ' ', sup.last_name) AS supervisor_name
        FROM public.survey_responses sr
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        LEFT JOIN public.profiles sup ON sup.id = sr.primary_supervisor_id
        WHERE sa.campaign_id = p_campaign_id
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
            AND sr.status = 'submitted'
            AND sr.response_data ? p_question_name
            AND p_dimension = 'supervisor'
        GROUP BY supervisor_name
        HAVING COUNT(*) >= 4
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
            CASE 
                WHEN jsonb_typeof(sr.response_data->p_question_name) = 'boolean' THEN
                    (sr.response_data->p_question_name)::text = 'true'
                ELSE
                    LOWER(sr.response_data->>p_question_name) IN ('true', '1', 'yes')
            END AS boolean_value
        FROM public.survey_responses sr
        JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
        LEFT JOIN public.profiles sup ON sup.id = sr.primary_supervisor_id
        LEFT JOIN public.sbus s ON s.id = sr.primary_sbu_id
        LEFT JOIN public.locations loc ON loc.id = sr.location_id
        LEFT JOIN public.employment_types et ON et.id = sr.employment_type_id
        LEFT JOIN public.employee_types ety ON ety.id = sr.employee_type_id
        LEFT JOIN public.employee_roles er ON er.id = sr.employee_role_id
        LEFT JOIN public.levels l ON l.id = sr.level_id
        WHERE sa.campaign_id = p_campaign_id
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
            AND sr.status = 'submitted'
            AND sr.response_data ? p_question_name
            AND (
                p_dimension != 'supervisor'
                OR CONCAT(sup.first_name, ' ', sup.last_name) IN (SELECT supervisor_name FROM supervisor_filter)
            )
    ),
    dimension_stats AS (
        SELECT
            dimension_value,
            COUNT(*) AS total_responses,
            COUNT(*) FILTER (WHERE boolean_value = true) AS yes_responses,
            COUNT(*) FILTER (WHERE boolean_value = false) AS no_responses,
            ROUND(
                (COUNT(*) FILTER (WHERE boolean_value = true)::NUMERIC / COUNT(*)::NUMERIC) * 100,
                1
            ) AS yes_percent
        FROM response_stats
        WHERE dimension_value IS NOT NULL
        GROUP BY dimension_value
    )
    SELECT 
        dimension_value AS dimension,
        total_responses AS response_count,
        yes_responses AS yes_count,
        no_responses AS no_count,
        yes_percent AS yes_percentage
    FROM dimension_stats
    ORDER BY yes_percent DESC;
END;
$function$;

-- Fix get_campaign_completion_stats function
CREATE OR REPLACE FUNCTION public.get_campaign_completion_stats(
    p_campaign_id uuid,
    p_instance_id uuid DEFAULT NULL
)
RETURNS TABLE(
    total_assignments bigint,
    completed_responses bigint,
    in_progress_responses bigint,
    not_started bigint,
    completion_rate numeric,
    average_completion_time interval
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH assignment_stats AS (
        SELECT 
            sa.id as assignment_id,
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM public.survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                        AND sr.status = 'submitted'
                ) THEN 'completed'
                WHEN EXISTS (
                    SELECT 1 FROM public.survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                        AND sr.status = 'in_progress'
                ) THEN 'in_progress'
                ELSE 'not_started'
            END as status,
            (
                SELECT (sr.submitted_at - sr.created_at)
                FROM public.survey_responses sr
                WHERE sr.assignment_id = sa.id
                    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                    AND sr.status = 'submitted'
                    AND sr.submitted_at IS NOT NULL
                LIMIT 1
            ) as completion_time
        FROM public.survey_assignments sa
        WHERE sa.campaign_id = p_campaign_id
    )
    SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE ast.status = 'completed') as completed_responses,
        COUNT(*) FILTER (WHERE ast.status = 'in_progress') as in_progress_responses,
        COUNT(*) FILTER (WHERE ast.status = 'not_started') as not_started,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE ast.status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        AVG(ast.completion_time) FILTER (WHERE ast.completion_time IS NOT NULL) as average_completion_time
    FROM assignment_stats ast;
END;
$function$;

-- Fix get_user_survey_history function
CREATE OR REPLACE FUNCTION public.get_user_survey_history(
    p_user_id uuid,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    survey_id uuid,
    survey_name text,
    campaign_id uuid,
    campaign_name text,
    response_id uuid,
    status text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as survey_id,
        s.name as survey_name,
        sc.id as campaign_id,
        sc.name as campaign_name,
        sr.id as response_id,
        sr.status::text,
        sr.submitted_at,
        sr.created_at
    FROM public.survey_assignments sa
    JOIN public.surveys s ON s.id = sa.survey_id
    LEFT JOIN public.survey_campaigns sc ON sc.id = sa.campaign_id
    LEFT JOIN public.survey_responses sr ON sr.assignment_id = sa.id
    WHERE sa.user_id = p_user_id
    ORDER BY COALESCE(sr.submitted_at, sr.created_at, sa.created_at) DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$function$;
