
-- Fix the next batch of database functions
-- Continuing with utility and data processing functions

-- Fix get_paginated_campaign_responses function
CREATE OR REPLACE FUNCTION public.get_paginated_campaign_responses(
    p_campaign_id uuid,
    p_instance_id uuid,
    p_search_term text DEFAULT NULL,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 20,
    p_sort_by text DEFAULT 'date',
    p_sort_direction text DEFAULT 'desc'
)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    assignment_id uuid,
    response_data jsonb,
    status text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone,
    user_details jsonb,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_offset integer := (p_page - 1) * p_page_size;
    v_total_count bigint;
BEGIN
    -- Get total count for pagination
    SELECT COUNT(*) INTO v_total_count
    FROM public.survey_responses sr
    JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
    JOIN public.profiles p ON p.id = sr.user_id
    WHERE sa.campaign_id = p_campaign_id
        AND sr.campaign_instance_id = p_instance_id
        AND sr.status = 'submitted'
        AND (
            p_search_term IS NULL
            OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        );

    RETURN QUERY
    SELECT 
        sr.id,
        sr.user_id,
        sr.assignment_id,
        sr.response_data,
        sr.status::text,
        sr.submitted_at,
        sr.created_at,
        jsonb_build_object(
            'id', p.id,
            'email', p.email,
            'first_name', COALESCE(p.first_name, ''),
            'last_name', COALESCE(p.last_name, ''),
            'location', CASE 
                WHEN l.id IS NOT NULL THEN jsonb_build_object('id', l.id, 'name', l.name)
                ELSE NULL
            END,
            'sbu', CASE 
                WHEN s.id IS NOT NULL THEN jsonb_build_object('id', s.id, 'name', s.name)
                ELSE NULL
            END
        ) as user_details,
        v_total_count as total_count
    FROM public.survey_responses sr
    JOIN public.survey_assignments sa ON sa.id = sr.assignment_id
    JOIN public.profiles p ON p.id = sr.user_id
    LEFT JOIN public.locations l ON l.id = sr.location_id
    LEFT JOIN public.sbus s ON s.id = sr.primary_sbu_id
    WHERE sa.campaign_id = p_campaign_id
        AND sr.campaign_instance_id = p_instance_id
        AND sr.status = 'submitted'
        AND (
            p_search_term IS NULL
            OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
            OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        )
    ORDER BY 
        CASE WHEN p_sort_by = 'date' AND p_sort_direction = 'desc' THEN sr.submitted_at END DESC,
        CASE WHEN p_sort_by = 'date' AND p_sort_direction = 'asc' THEN sr.submitted_at END ASC,
        CASE WHEN p_sort_by = 'name' AND p_sort_direction = 'asc' THEN CONCAT(p.first_name, ' ', p.last_name) END ASC,
        CASE WHEN p_sort_by = 'name' AND p_sort_direction = 'desc' THEN CONCAT(p.first_name, ' ', p.last_name) END DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$function$;

-- Fix get_campaign_instance_status_distribution function
CREATE OR REPLACE FUNCTION public.get_campaign_instance_status_distribution(
    p_campaign_id uuid,
    p_instance_id uuid
)
RETURNS TABLE(
    status text,
    count bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_total_count bigint;
BEGIN
    -- Get total assignments for percentage calculation
    SELECT COUNT(*) INTO v_total_count
    FROM public.survey_assignments sa
    WHERE sa.campaign_id = p_campaign_id;

    RETURN QUERY
    WITH status_counts AS (
        SELECT 
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM public.survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND sr.campaign_instance_id = p_instance_id
                        AND sr.status = 'submitted'
                ) THEN 'submitted'
                WHEN EXISTS (
                    SELECT 1 
                    FROM public.survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND sr.campaign_instance_id = p_instance_id
                        AND sr.status = 'in_progress'
                ) THEN 'in_progress'
                WHEN p_instance_id IS NOT NULL AND (
                    SELECT ci.ends_at 
                    FROM public.campaign_instances ci
                    WHERE ci.id = p_instance_id
                ) < NOW() THEN 'expired'
                ELSE 'assigned'
            END as assignment_status
        FROM public.survey_assignments sa
        WHERE sa.campaign_id = p_campaign_id
    )
    SELECT 
        sc.assignment_status as status,
        COUNT(*) as count,
        CASE 
            WHEN v_total_count > 0 THEN ROUND((COUNT(*)::numeric / v_total_count::numeric) * 100, 2)
            ELSE 0
        END as percentage
    FROM status_counts sc
    GROUP BY sc.assignment_status
    ORDER BY count DESC;
END;
$function$;

-- Fix search_users function
CREATE OR REPLACE FUNCTION public.search_users(
    p_search_term text,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    email text,
    first_name text,
    last_name text,
    designation text,
    status text,
    location_name text,
    sbu_name text,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_total_count bigint;
BEGIN
    -- Get total count for pagination
    SELECT COUNT(*) INTO v_total_count
    FROM public.profiles p
    WHERE (
        p_search_term IS NULL
        OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.designation, '')) LIKE '%' || LOWER(p_search_term) || '%'
    );

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        COALESCE(p.first_name, '') as first_name,
        COALESCE(p.last_name, '') as last_name,
        COALESCE(p.designation, '') as designation,
        p.status::text,
        COALESCE(l.name, '') as location_name,
        COALESCE(s.name, '') as sbu_name,
        v_total_count as total_count
    FROM public.profiles p
    LEFT JOIN public.locations l ON l.id = p.location_id
    LEFT JOIN public.user_sbus us ON us.user_id = p.id AND us.is_primary = true
    LEFT JOIN public.sbus s ON s.id = us.sbu_id
    WHERE (
        p_search_term IS NULL
        OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(COALESCE(p.designation, '')) LIKE '%' || LOWER(p_search_term) || '%'
    )
    ORDER BY 
        CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, '')) ASC,
        p.email ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$function$;

-- Fix get_user_board_permissions function
CREATE OR REPLACE FUNCTION public.get_user_board_permissions(
    p_user_id uuid,
    p_board_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_profile RECORD;
    v_permissions jsonb := '{"can_view": false, "can_create": false, "can_vote": false}'::jsonb;
    v_permission RECORD;
    v_matches boolean;
BEGIN
    -- Check if user is admin
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p_user_id AND ur.role = 'admin'
    ) THEN
        RETURN '{"can_view": true, "can_create": true, "can_vote": true}'::jsonb;
    END IF;

    -- Get user profile with related data
    SELECT 
        p.*,
        array_agg(DISTINCT us.sbu_id) FILTER (WHERE us.sbu_id IS NOT NULL) as sbu_ids,
        array_agg(DISTINCT usr.supervisor_id) FILTER (WHERE usr.supervisor_id IS NOT NULL) as supervisor_ids
    INTO v_user_profile
    FROM public.profiles p
    LEFT JOIN public.user_sbus us ON us.user_id = p.id
    LEFT JOIN public.user_supervisors usr ON usr.user_id = p.id
    WHERE p.id = p_user_id
    GROUP BY p.id, p.email, p.first_name, p.last_name, p.designation, p.org_id, 
             p.profile_image_url, p.status, p.created_at, p.updated_at, p.date_of_birth,
             p.gender, p.location_id, p.employment_type_id, p.employee_type_id,
             p.level_id, p.employee_role_id;

    -- Check each permission rule for this board (ordered by priority)
    FOR v_permission IN 
        SELECT * FROM public.issue_board_permissions 
        WHERE board_id = p_board_id AND is_active = true
        ORDER BY COALESCE(priority, 100) ASC
    LOOP
        v_matches := true;

        -- Check SBU criteria
        IF v_permission.sbu_ids IS NOT NULL AND array_length(v_permission.sbu_ids, 1) > 0 THEN
            IF v_user_profile.sbu_ids IS NULL OR 
               NOT (v_user_profile.sbu_ids && v_permission.sbu_ids) THEN
                v_matches := false;
            END IF;
        END IF;

        -- Check location criteria
        IF v_matches AND v_permission.location_ids IS NOT NULL AND array_length(v_permission.location_ids, 1) > 0 THEN
            IF v_user_profile.location_id IS NULL OR 
               NOT (v_user_profile.location_id = ANY(v_permission.location_ids)) THEN
                v_matches := false;
            END IF;
        END IF;

        -- Check level criteria
        IF v_matches AND v_permission.level_ids IS NOT NULL AND array_length(v_permission.level_ids, 1) > 0 THEN
            IF v_user_profile.level_id IS NULL OR 
               NOT (v_user_profile.level_id = ANY(v_permission.level_ids)) THEN
                v_matches := false;
            END IF;
        END IF;

        -- Check employment type criteria
        IF v_matches AND v_permission.employment_type_ids IS NOT NULL AND array_length(v_permission.employment_type_ids, 1) > 0 THEN
            IF v_user_profile.employment_type_id IS NULL OR 
               NOT (v_user_profile.employment_type_id = ANY(v_permission.employment_type_ids)) THEN
                v_matches := false;
            END IF;
        END IF;

        -- Check employee type criteria
        IF v_matches AND v_permission.employee_type_ids IS NOT NULL AND array_length(v_permission.employee_type_ids, 1) > 0 THEN
            IF v_user_profile.employee_type_id IS NULL OR 
               NOT (v_user_profile.employee_type_id = ANY(v_permission.employee_type_ids)) THEN
                v_matches := false;
            END IF;
        END IF;

        -- Check employee role criteria
        IF v_matches AND v_permission.employee_role_ids IS NOT NULL AND array_length(v_permission.employee_role_ids, 1) > 0 THEN
            IF v_user_profile.employee_role_id IS NULL OR 
               NOT (v_user_profile.employee_role_id = ANY(v_permission.employee_role_ids)) THEN
                v_matches := false;
            END IF;
        END IF;

        -- If this rule matches, apply permissions based on rule type
        IF v_matches THEN
            IF v_permission.rule_type = 'exclude' THEN
                -- Exclude rule - remove permissions
                v_permissions := jsonb_set(v_permissions, '{can_view}', 'false');
                v_permissions := jsonb_set(v_permissions, '{can_create}', 'false');
                v_permissions := jsonb_set(v_permissions, '{can_vote}', 'false');
                EXIT; -- Exit on first exclude match
            ELSE
                -- Include rule - grant permissions
                IF v_permission.can_view THEN
                    v_permissions := jsonb_set(v_permissions, '{can_view}', 'true');
                END IF;
                IF v_permission.can_create THEN
                    v_permissions := jsonb_set(v_permissions, '{can_create}', 'true');
                END IF;
                IF v_permission.can_vote THEN
                    v_permissions := jsonb_set(v_permissions, '{can_vote}', 'true');
                END IF;
            END IF;
        END IF;
    END LOOP;

    RETURN v_permissions;
END;
$function$;
