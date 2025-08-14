
-- Fix the next batch of database functions
-- Continuing with data retrieval and analysis functions

-- Fix get_campaign_instances function
CREATE OR REPLACE FUNCTION public.get_campaign_instances(
    p_campaign_id uuid,
    p_start_date_min timestamp with time zone DEFAULT NULL,
    p_start_date_max timestamp with time zone DEFAULT NULL,
    p_end_date_min timestamp with time zone DEFAULT NULL,
    p_end_date_max timestamp with time zone DEFAULT NULL,
    p_status text DEFAULT NULL,
    p_sort_by text DEFAULT 'period_number',
    p_sort_direction text DEFAULT 'asc',
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 10
)
RETURNS TABLE(
    id uuid,
    campaign_id uuid,
    period_number integer,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_offset integer := (p_page - 1) * p_page_size;
    v_total_count bigint;
    v_order_clause text;
BEGIN
    -- Get total count first
    SELECT COUNT(*) INTO v_total_count
    FROM public.campaign_instances ci
    WHERE ci.campaign_id = p_campaign_id
        AND (p_start_date_min IS NULL OR ci.starts_at >= p_start_date_min)
        AND (p_start_date_max IS NULL OR ci.starts_at <= p_start_date_max)
        AND (p_end_date_min IS NULL OR ci.ends_at >= p_end_date_min)
        AND (p_end_date_max IS NULL OR ci.ends_at <= p_end_date_max)
        AND (p_status IS NULL OR ci.status::text = p_status);

    -- Build order clause
    v_order_clause := CASE 
        WHEN p_sort_by = 'period_number' AND p_sort_direction = 'desc' THEN 'ORDER BY ci.period_number DESC'
        WHEN p_sort_by = 'starts_at' AND p_sort_direction = 'asc' THEN 'ORDER BY ci.starts_at ASC'
        WHEN p_sort_by = 'starts_at' AND p_sort_direction = 'desc' THEN 'ORDER BY ci.starts_at DESC'
        WHEN p_sort_by = 'ends_at' AND p_sort_direction = 'asc' THEN 'ORDER BY ci.ends_at ASC'
        WHEN p_sort_by = 'ends_at' AND p_sort_direction = 'desc' THEN 'ORDER BY ci.ends_at DESC'
        WHEN p_sort_by = 'status' AND p_sort_direction = 'asc' THEN 'ORDER BY ci.status ASC'
        WHEN p_sort_by = 'status' AND p_sort_direction = 'desc' THEN 'ORDER BY ci.status DESC'
        ELSE 'ORDER BY ci.period_number ASC'
    END;

    RETURN QUERY
    SELECT 
        ci.id,
        ci.campaign_id,
        ci.period_number,
        ci.starts_at,
        ci.ends_at,
        ci.status::text,
        ci.created_at,
        ci.updated_at,
        v_total_count as total_count
    FROM public.campaign_instances ci
    WHERE ci.campaign_id = p_campaign_id
        AND (p_start_date_min IS NULL OR ci.starts_at >= p_start_date_min)
        AND (p_start_date_max IS NULL OR ci.starts_at <= p_start_date_max)
        AND (p_end_date_min IS NULL OR ci.ends_at >= p_end_date_min)
        AND (p_end_date_max IS NULL OR ci.ends_at <= p_end_date_max)
        AND (p_status IS NULL OR ci.status::text = p_status)
    ORDER BY 
        CASE WHEN p_sort_by = 'period_number' AND p_sort_direction = 'asc' THEN ci.period_number END ASC,
        CASE WHEN p_sort_by = 'period_number' AND p_sort_direction = 'desc' THEN ci.period_number END DESC,
        CASE WHEN p_sort_by = 'starts_at' AND p_sort_direction = 'asc' THEN ci.starts_at END ASC,
        CASE WHEN p_sort_by = 'starts_at' AND p_sort_direction = 'desc' THEN ci.starts_at END DESC,
        CASE WHEN p_sort_by = 'ends_at' AND p_sort_direction = 'asc' THEN ci.ends_at END ASC,
        CASE WHEN p_sort_by = 'ends_at' AND p_sort_direction = 'desc' THEN ci.ends_at END DESC,
        CASE WHEN p_sort_by = 'status' AND p_sort_direction = 'asc' THEN ci.status::text END ASC,
        CASE WHEN p_sort_by = 'status' AND p_sort_direction = 'desc' THEN ci.status::text END DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$function$;

-- Fix create_next_campaign_instance function
CREATE OR REPLACE FUNCTION public.create_next_campaign_instance(p_campaign_id uuid)
RETURNS TABLE(
    id uuid,
    campaign_id uuid,
    period_number integer,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_campaign RECORD;
    v_last_instance RECORD;
    v_next_period_number integer;
    v_next_starts_at timestamp with time zone;
    v_next_ends_at timestamp with time zone;
    v_new_instance_id uuid;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign
    FROM public.survey_campaigns sc
    WHERE sc.id = p_campaign_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found';
    END IF;

    -- Get the last instance to determine next period number and dates
    SELECT * INTO v_last_instance
    FROM public.campaign_instances ci
    WHERE ci.campaign_id = p_campaign_id
    ORDER BY ci.period_number DESC
    LIMIT 1;

    IF FOUND THEN
        v_next_period_number := v_last_instance.period_number + 1;
        
        -- Calculate next dates based on recurring frequency
        IF v_campaign.recurring_frequency = 'monthly' THEN
            v_next_starts_at := v_last_instance.starts_at + INTERVAL '1 month';
            v_next_ends_at := v_last_instance.ends_at + INTERVAL '1 month';
        ELSIF v_campaign.recurring_frequency = 'quarterly' THEN
            v_next_starts_at := v_last_instance.starts_at + INTERVAL '3 months';
            v_next_ends_at := v_last_instance.ends_at + INTERVAL '3 months';
        ELSIF v_campaign.recurring_frequency = 'weekly' THEN
            v_next_starts_at := v_last_instance.starts_at + INTERVAL '1 week';
            v_next_ends_at := v_last_instance.ends_at + INTERVAL '1 week';
        ELSE
            -- Default to campaign duration
            v_next_starts_at := v_last_instance.ends_at + INTERVAL '1 day';
            v_next_ends_at := v_next_starts_at + INTERVAL '1 month';
        END IF;
    ELSE
        -- First instance
        v_next_period_number := 1;
        v_next_starts_at := v_campaign.starts_at;
        
        IF v_campaign.instance_duration_days IS NOT NULL THEN
            v_next_ends_at := v_next_starts_at + (v_campaign.instance_duration_days || ' days')::INTERVAL;
        ELSE
            v_next_ends_at := v_campaign.ends_at;
        END IF;
    END IF;

    -- Insert new instance
    INSERT INTO public.campaign_instances (
        campaign_id,
        period_number,
        starts_at,
        ends_at,
        status
    ) VALUES (
        p_campaign_id,
        v_next_period_number,
        v_next_starts_at,
        v_next_ends_at,
        'upcoming'
    ) RETURNING * INTO v_new_instance_id;

    -- Return the new instance
    RETURN QUERY
    SELECT 
        ci.id,
        ci.campaign_id,
        ci.period_number,
        ci.starts_at,
        ci.ends_at,
        ci.status::text,
        ci.created_at,
        ci.updated_at
    FROM public.campaign_instances ci
    WHERE ci.id = v_new_instance_id;
END;
$function$;

-- Fix get_campaign_sbu_performance function
CREATE OR REPLACE FUNCTION public.get_campaign_sbu_performance(
    p_campaign_id uuid,
    p_instance_id uuid
)
RETURNS TABLE(
    rank integer,
    sbu_name text,
    total_assigned bigint,
    total_completed bigint,
    avg_score numeric,
    completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH sbu_stats AS (
        SELECT 
            s.name as sbu_name,
            COUNT(sa.id) as total_assigned,
            COUNT(sr.id) FILTER (WHERE sr.status = 'submitted') as total_completed,
            AVG(
                CASE 
                    WHEN jsonb_typeof(sr.response_data) = 'object' THEN
                        -- Calculate average of all numeric responses
                        (
                            SELECT AVG((value)::numeric)
                            FROM jsonb_each_text(sr.response_data) 
                            WHERE value ~ '^[0-9]+(\.[0-9]+)?$'
                        )
                    ELSE NULL
                END
            ) as avg_score
        FROM public.survey_assignments sa
        JOIN public.profiles p ON p.id = sa.user_id
        JOIN public.user_sbus us ON us.user_id = p.id AND us.is_primary = true
        JOIN public.sbus s ON s.id = us.sbu_id
        LEFT JOIN public.survey_responses sr ON sr.assignment_id = sa.id 
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
        WHERE sa.campaign_id = p_campaign_id
        GROUP BY s.name
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY 
            CASE 
                WHEN ss.total_assigned > 0 THEN (ss.total_completed::numeric / ss.total_assigned::numeric) * 100
                ELSE 0
            END DESC,
            COALESCE(ss.avg_score, 0) DESC
        )::integer as rank,
        ss.sbu_name,
        ss.total_assigned,
        ss.total_completed,
        ROUND(COALESCE(ss.avg_score, 0), 2) as avg_score,
        CASE 
            WHEN ss.total_assigned > 0 THEN ROUND((ss.total_completed::numeric / ss.total_assigned::numeric) * 100, 1)
            ELSE 0
        END as completion_rate
    FROM sbu_stats ss
    ORDER BY rank;
END;
$function$;

-- Fix get_campaign_supervisor_performance function
CREATE OR REPLACE FUNCTION public.get_campaign_supervisor_performance(
    p_campaign_id uuid,
    p_instance_id uuid
)
RETURNS TABLE(
    rank integer,
    supervisor_name text,
    sbu_name text,
    total_assigned bigint,
    total_completed bigint,
    avg_score numeric,
    completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    WITH supervisor_stats AS (
        SELECT 
            CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name,
            s.name as sbu_name,
            COUNT(sa.id) as total_assigned,
            COUNT(sr.id) FILTER (WHERE sr.status = 'submitted') as total_completed,
            AVG(
                CASE 
                    WHEN jsonb_typeof(sr.response_data) = 'object' THEN
                        (
                            SELECT AVG((value)::numeric)
                            FROM jsonb_each_text(sr.response_data) 
                            WHERE value ~ '^[0-9]+(\.[0-9]+)?$'
                        )
                    ELSE NULL
                END
            ) as avg_score
        FROM public.survey_assignments sa
        JOIN public.profiles p ON p.id = sa.user_id
        JOIN public.user_supervisors usup ON usup.user_id = p.id AND usup.is_primary = true
        JOIN public.profiles sup ON sup.id = usup.supervisor_id
        LEFT JOIN public.user_sbus us ON us.user_id = sup.id AND us.is_primary = true
        LEFT JOIN public.sbus s ON s.id = us.sbu_id
        LEFT JOIN public.survey_responses sr ON sr.assignment_id = sa.id 
            AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
        WHERE sa.campaign_id = p_campaign_id
        GROUP BY sup.id, sup.first_name, sup.last_name, s.name
        HAVING COUNT(sa.id) >= 4  -- Minimum threshold for supervisor analysis
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY 
            CASE 
                WHEN ss.total_assigned > 0 THEN (ss.total_completed::numeric / ss.total_assigned::numeric) * 100
                ELSE 0
            END DESC,
            COALESCE(ss.avg_score, 0) DESC
        )::integer as rank,
        ss.supervisor_name,
        COALESCE(ss.sbu_name, 'Unknown') as sbu_name,
        ss.total_assigned,
        ss.total_completed,
        ROUND(COALESCE(ss.avg_score, 0), 2) as avg_score,
        CASE 
            WHEN ss.total_assigned > 0 THEN ROUND((ss.total_completed::numeric / ss.total_assigned::numeric) * 100, 1)
            ELSE 0
        END as completion_rate
    FROM supervisor_stats ss
    ORDER BY rank;
END;
$function$;
