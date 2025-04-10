
-- Create a new RPC function that supports pagination and filtering
CREATE OR REPLACE FUNCTION public.get_paginated_campaign_assignments(
    p_campaign_id UUID,
    p_instance_id UUID = NULL,
    p_status TEXT = NULL,
    p_search_term TEXT = NULL,
    p_page INTEGER = 1,
    p_page_size INTEGER = 20
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    campaign_id UUID,
    public_access_token UUID,
    last_reminder_sent TIMESTAMPTZ,
    status TEXT,
    user_details JSONB,
    response JSONB,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_page_size;
    v_total_count BIGINT;
BEGIN
    -- First, get the total count for pagination
    SELECT COUNT(*) INTO v_total_count
    FROM survey_assignments sa
    LEFT JOIN profiles p ON p.id = sa.user_id
    LEFT JOIN user_sbus us ON us.user_id = p.id
    WHERE sa.campaign_id = p_campaign_id
    AND (
        p_search_term IS NULL
        OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) LIKE '%' || LOWER(p_search_term) || '%'
    );

    -- Then get the assignments with pagination
    RETURN QUERY
    WITH assignment_status AS (
        SELECT
            sa.id,
            sa.user_id,
            sa.campaign_id,
            sa.public_access_token,
            sa.last_reminder_sent,
            -- Calculated status based on response or instance end date
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                    AND sr.status = 'submitted'
                ) THEN 'submitted'
                WHEN EXISTS (
                    SELECT 1 
                    FROM survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                    AND sr.status = 'in_progress'
                ) THEN 'in_progress'
                WHEN p_instance_id IS NOT NULL AND (
                    SELECT ends_at 
                    FROM campaign_instances 
                    WHERE id = p_instance_id
                ) < NOW() THEN 'expired'
                ELSE 'assigned'
            END as status,
            -- User details
            (
                SELECT jsonb_build_object(
                    'id', p.id,
                    'email', COALESCE(p.email, ''),
                    'first_name', COALESCE(p.first_name, ''),
                    'last_name', COALESCE(p.last_name, ''),
                    'user_sbus', COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'is_primary', us.is_primary,
                                'sbu', jsonb_build_object(
                                    'id', s.id,
                                    'name', s.name
                                )
                            )
                        ) FILTER (WHERE us.id IS NOT NULL),
                        '[]'::jsonb
                    )
                )
                FROM profiles p
                LEFT JOIN user_sbus us ON us.user_id = p.id
                LEFT JOIN sbus s ON s.id = us.sbu_id
                WHERE p.id = sa.user_id
                GROUP BY p.id
            ) as user_details,
            -- Response data
            (
                SELECT jsonb_build_object(
                    'status', sr.status,
                    'campaign_instance_id', sr.campaign_instance_id,
                    'data', sr.response_data
                )
                FROM survey_responses sr
                WHERE sr.assignment_id = sa.id
                AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
                LIMIT 1
            ) as response
        FROM survey_assignments sa
        JOIN profiles p ON p.id = sa.user_id
        LEFT JOIN user_sbus us ON us.user_id = p.id
        WHERE sa.campaign_id = p_campaign_id
        AND (
            p_search_term IS NULL
            OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) LIKE '%' || LOWER(p_search_term) || '%'
        )
    )
    SELECT 
        a.id,
        a.user_id,
        a.campaign_id,
        a.public_access_token,
        a.last_reminder_sent,
        a.status,
        a.user_details,
        a.response,
        v_total_count as total_count
    FROM assignment_status a
    WHERE (p_status IS NULL OR a.status = p_status)
    ORDER BY 
        CASE 
            WHEN a.status = 'submitted' THEN 1
            WHEN a.status = 'in_progress' THEN 2
            WHEN a.status = 'assigned' THEN 3
            ELSE 4
        END
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$;

-- Indexing to improve performance
CREATE INDEX IF NOT EXISTS idx_survey_assignments_campaign_id ON survey_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles(email, first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_survey_responses_assignment_instance ON survey_responses(assignment_id, campaign_instance_id);
