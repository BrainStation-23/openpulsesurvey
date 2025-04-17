
-- First create a helper function to drop and recreate our main function
CREATE OR REPLACE FUNCTION public.drop_and_recreate_question_responses_function()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop the function if it exists
    DROP FUNCTION IF EXISTS public.get_instance_question_responses(uuid, uuid);
    
    -- Recreate the function with the new signature
    CREATE OR REPLACE FUNCTION public.get_instance_question_responses(
        p_campaign_id UUID,
        p_instance_id UUID
    )
    RETURNS TABLE(
        campaign_instance_id UUID,
        response_count INTEGER,
        avg_numeric_value NUMERIC,
        yes_percentage NUMERIC,
        question_key TEXT,
        text_responses TEXT[]
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    BEGIN
        RETURN QUERY
        WITH survey_questions AS (
            -- Get questions from survey data
            SELECT 
                q.value->>'name' AS question_key,
                q.value->>'type' AS question_type
            FROM 
                survey_campaigns sc
                JOIN surveys s ON s.id = sc.survey_id,
                jsonb_array_elements(s.json_data->'pages') as pages,
                jsonb_array_elements(pages->'elements') as q
            WHERE 
                sc.id = p_campaign_id
                AND q.value->>'name' IS NOT NULL
        ),
        response_data AS (
            -- Get responses for the instance
            SELECT 
                sr.campaign_instance_id,
                sr.response_data
            FROM 
                survey_responses sr
                JOIN survey_assignments sa ON sr.assignment_id = sa.id
            WHERE 
                sa.campaign_id = p_campaign_id
                AND sr.campaign_instance_id = p_instance_id
                AND sr.status = 'submitted'
        ),
        processed_responses AS (
            -- Process each response by question type
            SELECT 
                rd.campaign_instance_id,
                sq.question_key,
                sq.question_type,
                rd.response_data->>sq.question_key AS response_value
            FROM 
                survey_questions sq
                CROSS JOIN response_data rd
            WHERE 
                rd.response_data ? sq.question_key
                AND rd.response_data->>sq.question_key IS NOT NULL
        )
        -- Final aggregation
        SELECT
            pr.campaign_instance_id,
            COUNT(*)::INTEGER AS response_count,
            -- Handle rating questions
            CASE 
                WHEN pr.question_type = 'rating' 
                AND pr.response_value ~ '^[0-9]+(\.[0-9]+)?$'
                THEN AVG(pr.response_value::NUMERIC)
                ELSE NULL 
            END AS avg_numeric_value,
            -- Handle boolean questions
            CASE 
                WHEN pr.question_type = 'boolean' 
                THEN (
                    SUM(
                        CASE 
                            WHEN LOWER(pr.response_value) IN ('true', '1', 'yes') THEN 1 
                            ELSE 0 
                        END
                    )::NUMERIC / COUNT(*)::NUMERIC * 100
                )
                ELSE NULL 
            END AS yes_percentage,
            pr.question_key,
            -- Handle text responses
            CASE 
                WHEN pr.question_type IN ('text', 'comment') 
                THEN array_remove(array_agg(pr.response_value), NULL)
                ELSE NULL 
            END AS text_responses
        FROM 
            processed_responses pr
        GROUP BY 
            pr.campaign_instance_id,
            pr.question_key,
            pr.question_type
        ORDER BY 
            pr.question_key;
    END;
    $func$;
END;
$$;

-- Now call the function to ensure it runs immediately
SELECT drop_and_recreate_question_responses_function();
