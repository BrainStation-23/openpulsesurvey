
-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate public access token function
CREATE OR REPLACE FUNCTION generate_public_access_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.public_access_token IS NULL THEN
        NEW.public_access_token := gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, org_id)
  VALUES (new.id, new.email, NULL);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Check if user is admin function
CREATE OR REPLACE FUNCTION is_admin(user_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uid 
    AND role = 'admin'
  );
END;
$$;

-- User cascade deletion function
CREATE OR REPLACE FUNCTION delete_user_cascade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM user_roles WHERE user_id = OLD.id;
    DELETE FROM user_sbus WHERE user_id = OLD.id;
    DELETE FROM user_supervisors WHERE user_id = OLD.id OR supervisor_id = OLD.id;
    DELETE FROM survey_assignments WHERE user_id = OLD.id;
    DELETE FROM survey_responses WHERE user_id = OLD.id;
    UPDATE sbus SET head_id = NULL WHERE head_id = OLD.id;
    
    UPDATE profiles 
    SET 
        employee_role_id = NULL,
        employee_type_id = NULL,
        employment_type_id = NULL,
        level_id = NULL,
        location_id = NULL
    WHERE id = OLD.id;
    
    DELETE FROM profiles WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Search users function with complete implementation
CREATE OR REPLACE FUNCTION search_users(
    search_text TEXT,
    page_number INTEGER,
    page_size INTEGER,
    sbu_filter UUID DEFAULT NULL,
    level_filter UUID DEFAULT NULL,
    location_filter UUID DEFAULT NULL,
    employment_type_filter UUID DEFAULT NULL,
    employee_role_filter UUID DEFAULT NULL,
    employee_type_filter UUID DEFAULT NULL
)
RETURNS TABLE(profile json, total_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    status_filter text;
    role_filter text;
    base_search text;
    query text;
BEGIN
    -- Extract filters using regex
    status_filter := (SELECT SUBSTRING(search_text FROM 'status:([^\s]+)'));
    role_filter := (SELECT SUBSTRING(search_text FROM 'role:([^\s]+)'));
    -- Remove filters from base search
    base_search := regexp_replace(regexp_replace(search_text, 'status:\S+\s*', ''), 'role:\S+\s*', '');

    -- Build the base query
    query := 'WITH filtered_profiles AS (
        SELECT 
            p.*,
            ur.role,
            l.name as level_name,
            loc.name as location_name,
            et.name as employment_type_name,
            er.name as employee_role_name,
            ety.name as employee_type_name,
            (
                SELECT json_build_object(
                    ''id'', supervisor.id,
                    ''email'', supervisor.email,
                    ''first_name'', supervisor.first_name,
                    ''last_name'', supervisor.last_name
                )
                FROM user_supervisors us
                JOIN profiles supervisor ON supervisor.id = us.supervisor_id
                WHERE us.user_id = p.id AND us.is_primary = true
                LIMIT 1
            ) as primary_supervisor,
            COALESCE(
                json_agg(
                    json_build_object(
                        ''id'', us.id,
                        ''user_id'', us.user_id,
                        ''sbu_id'', us.sbu_id,
                        ''is_primary'', us.is_primary,
                        ''sbu'', json_build_object(
                            ''id'', s.id,
                            ''name'', s.name
                        )
                    )
                ) FILTER (WHERE us.id IS NOT NULL),
                ''[]''::json
            ) as user_sbus
        FROM profiles p
        LEFT JOIN user_roles ur ON ur.user_id = p.id
        LEFT JOIN user_sbus us ON us.user_id = p.id
        LEFT JOIN sbus s ON s.id = us.sbu_id
        LEFT JOIN levels l ON l.id = p.level_id
        LEFT JOIN locations loc ON loc.id = p.location_id
        LEFT JOIN employment_types et ON et.id = p.employment_type_id
        LEFT JOIN employee_roles er ON er.id = p.employee_role_id
        LEFT JOIN employee_types ety ON ety.id = p.employee_type_id
        WHERE 1=1';

    -- Add SBU filter if provided
    IF sbu_filter IS NOT NULL THEN
        query := query || ' AND EXISTS (
            SELECT 1 FROM user_sbus us 
            WHERE us.user_id = p.id AND us.sbu_id = ''' || sbu_filter || '''
        )';
    END IF;

    -- Add level filter if provided
    IF level_filter IS NOT NULL THEN
        query := query || ' AND p.level_id = ''' || level_filter || '''';
    END IF;

    -- Add location filter if provided
    IF location_filter IS NOT NULL THEN
        query := query || ' AND p.location_id = ''' || location_filter || '''';
    END IF;

    -- Add employment type filter if provided
    IF employment_type_filter IS NOT NULL THEN
        query := query || ' AND p.employment_type_id = ''' || employment_type_filter || '''';
    END IF;

    -- Add employee role filter if provided
    IF employee_role_filter IS NOT NULL THEN
        query := query || ' AND p.employee_role_id = ''' || employee_role_filter || '''';
    END IF;

    -- Add employee type filter if provided
    IF employee_type_filter IS NOT NULL THEN
        query := query || ' AND p.employee_type_id = ''' || employee_type_filter || '''';
    END IF;

    -- Add status filter if present
    IF status_filter IS NOT NULL THEN
        query := query || ' AND p.status = ''' || status_filter || '''::profile_status';
    END IF;

    -- Add role filter if present
    IF role_filter IS NOT NULL THEN
        query := query || ' AND ur.role = ''' || role_filter || '''::user_role';
    END IF;

    -- Add base search if present
    IF base_search IS NOT NULL AND base_search != '' THEN
        query := query || ' AND (
            p.email ILIKE ''%' || base_search || '%'' OR
            p.first_name ILIKE ''%' || base_search || '%'' OR
            p.last_name ILIKE ''%' || base_search || '%'' OR
            p.org_id ILIKE ''%' || base_search || '%''
        )';
    END IF;

    query := query || ' GROUP BY p.id, ur.role, l.name, loc.name, et.name, er.name, ety.name';

    query := query || ')
        SELECT 
            json_build_object(
                ''id'', p.id,
                ''email'', p.email,
                ''first_name'', p.first_name,
                ''last_name'', p.last_name,
                ''profile_image_url'', p.profile_image_url,
                ''org_id'', p.org_id,
                ''gender'', p.gender,
                ''date_of_birth'', p.date_of_birth,
                ''designation'', p.designation,
                ''status'', p.status,
                ''level'', p.level_name,
                ''location'', p.location_name,
                ''employment_type'', p.employment_type_name,
                ''employee_role'', p.employee_role_name,
                ''employee_type'', p.employee_type_name,
                ''user_roles'', json_build_object(''role'', p.role),
                ''user_sbus'', p.user_sbus,
                ''primary_supervisor'', p.primary_supervisor
            ) as profile,
            COUNT(*) OVER() as total_count
        FROM filtered_profiles p
        ORDER BY p.created_at DESC
        LIMIT ' || page_size || '
        OFFSET ' || (page_number - 1) * page_size;

    RETURN QUERY EXECUTE query;
END;
$$;

-- Calculate instance completion rate function
CREATE OR REPLACE FUNCTION calculate_instance_completion_rate(instance_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    total_assignments INTEGER;
    completed_responses INTEGER;
    completion_rate NUMERIC;
BEGIN
    -- Get total assignments for the campaign
    SELECT COUNT(DISTINCT sa.id)
    INTO total_assignments
    FROM survey_assignments sa
    WHERE sa.campaign_id = (
        SELECT campaign_id 
        FROM campaign_instances 
        WHERE id = instance_id
    );

    -- Get completed responses for this instance
    SELECT COUNT(DISTINCT sr.assignment_id)
    INTO completed_responses
    FROM survey_responses sr
    WHERE sr.campaign_instance_id = instance_id
    AND sr.status = 'submitted';

    -- Calculate completion rate
    IF total_assignments = 0 THEN
        completion_rate := 0;
    ELSE
        completion_rate := (completed_responses::NUMERIC / total_assignments::NUMERIC) * 100;
    END IF;

    RETURN ROUND(completion_rate, 1);
END;
$$;

-- Get campaign analysis data function
CREATE OR REPLACE FUNCTION get_campaign_analysis_data(p_campaign_id UUID, p_instance_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
    v_campaign_info jsonb;
    v_instance_info jsonb;
    v_location_data jsonb;
    v_sbu_data jsonb;
    v_instance_stats jsonb;
BEGIN
    -- Get campaign basic info
    SELECT jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'anonymous', c.anonymous
    )
    INTO v_campaign_info
    FROM survey_campaigns c
    WHERE c.id = p_campaign_id;

    -- Get specific instance information
    IF p_instance_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'instance_id', ci.id,
            'period_number', ci.period_number,
            'starts_at', ci.starts_at,
            'ends_at', ci.ends_at,
            'completion_rate', ci.completion_rate,
            'status', ci.status,
            'total_assignments', COUNT(DISTINCT sa.id),
            'completed_assignments', COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN sa.id END)
        )
        INTO v_instance_info
        FROM campaign_instances ci
        LEFT JOIN survey_assignments sa ON sa.campaign_id = ci.campaign_id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id AND sr.campaign_instance_id = ci.id
        WHERE ci.id = p_instance_id
        GROUP BY ci.id;
    END IF;

    -- Get location statistics
    SELECT jsonb_agg(loc_data)
    INTO v_location_data
    FROM (
        SELECT jsonb_build_object(
            'location', loc.name,
            'total_assignments', COUNT(sa.id),
            'completed_assignments', COUNT(CASE WHEN sr.id IS NOT NULL THEN 1 END)
        ) as loc_data
        FROM locations loc
        JOIN profiles p ON p.location_id = loc.id
        JOIN survey_assignments sa ON sa.user_id = p.id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id
            AND sr.campaign_instance_id = p_instance_id
        WHERE sa.campaign_id = p_campaign_id
        AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
        GROUP BY loc.name
    ) subq;

    -- Get SBU statistics
    SELECT jsonb_agg(sbu_data)
    INTO v_sbu_data
    FROM (
        SELECT jsonb_build_object(
            'sbu', s.name,
            'total_assignments', COUNT(sa.id),
            'completed_assignments', COUNT(CASE WHEN sr.id IS NOT NULL THEN 1 END)
        ) as sbu_data
        FROM sbus s
        JOIN user_sbus us ON us.sbu_id = s.id AND us.is_primary = true
        JOIN survey_assignments sa ON sa.user_id = us.user_id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id
            AND sr.campaign_instance_id = p_instance_id
        WHERE sa.campaign_id = p_campaign_id
        AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
        GROUP BY s.name
    ) subq;

    -- Get instance statistics
    IF p_instance_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'response_count', COUNT(DISTINCT sr.id),
            'unique_respondents', COUNT(DISTINCT sr.user_id),
            'avg_completion_time', EXTRACT(epoch FROM AVG(sr.updated_at - sr.created_at))::integer,
            'response_timeline', (
                SELECT jsonb_agg(timeline)
                FROM (
                    SELECT date_trunc('day', sr_inner.created_at) as response_date,
                    COUNT(*) as daily_responses
                    FROM survey_responses sr_inner
                    WHERE sr_inner.campaign_instance_id = p_instance_id
                    GROUP BY date_trunc('day', sr_inner.created_at)
                    ORDER BY date_trunc('day', sr_inner.created_at)
                ) timeline
            )
        )
        INTO v_instance_stats
        FROM survey_responses sr
        WHERE sr.campaign_instance_id = p_instance_id;
    END IF;

    -- Combine all data
    SELECT jsonb_build_object(
        'campaign_info', v_campaign_info,
        'instance_info', COALESCE(v_instance_info, '{}'::jsonb),
        'demographic_stats', jsonb_build_object(
            'by_location', COALESCE(v_location_data, '[]'::jsonb),
            'by_sbu', COALESCE(v_sbu_data, '[]'::jsonb)
        ),
        'instance_stats', COALESCE(v_instance_stats, '{}'::jsonb)
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Validate campaign dates function
CREATE OR REPLACE FUNCTION validate_campaign_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure instance_duration_days is set for recurring campaigns
    IF NEW.is_recurring AND NEW.instance_duration_days IS NULL THEN
        RAISE EXCEPTION 'Instance duration is required for recurring campaigns';
    END IF;

    -- Ensure instance_end_time is set for recurring campaigns
    IF NEW.is_recurring AND NEW.instance_end_time IS NULL THEN
        RAISE EXCEPTION 'Instance end time is required for recurring campaigns';
    END IF;

    -- Ensure ends_at is set for recurring campaigns
    IF NEW.is_recurring AND NEW.ends_at IS NULL THEN
        RAISE EXCEPTION 'End date is required for recurring campaigns';
    END IF;

    -- Ensure ends_at is after starts_at
    IF NEW.ends_at <= NEW.starts_at THEN
        RAISE EXCEPTION 'End date must be after start date';
    END IF;

    RETURN NEW;
END;
$$;

-- Get my survey assignments function
CREATE OR REPLACE FUNCTION get_my_survey_assignments(p_user_id UUID)
RETURNS TABLE(
    id UUID,
    survey_id UUID,
    campaign_id UUID,
    user_id UUID,
    public_access_token UUID,
    last_reminder_sent TIMESTAMPTZ,
    instance JSONB,
    survey JSONB,
    status TEXT,
    response JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH active_instances AS (
        -- Get instances from non-draft campaigns only
        SELECT 
            ci.id,
            ci.campaign_id,
            ci.starts_at,
            ci.ends_at,
            ci.status,
            ci.period_number
        FROM campaign_instances ci
        JOIN survey_campaigns sc ON ci.campaign_id = sc.id
        WHERE sc.status != 'draft'
        AND ci.status = 'active'
    ),
    assignment_info AS (
        SELECT 
            sa.id,
            sa.survey_id,
            sa.user_id,
            sa.campaign_id,
            sa.public_access_token,
            sa.last_reminder_sent,
            -- Get the specific instance response
            (SELECT sr.response_data 
             FROM survey_responses sr 
             WHERE sr.assignment_id = sa.id 
               AND sr.campaign_instance_id = ai.id
             LIMIT 1) as response_data,
            -- Get the response status
            (SELECT sr.status 
             FROM survey_responses sr 
             WHERE sr.assignment_id = sa.id 
               AND sr.campaign_instance_id = ai.id
             LIMIT 1) as response_status,
            -- Instance details
            jsonb_build_object(
                'id', ai.id,
                'starts_at', ai.starts_at,
                'ends_at', ai.ends_at,
                'status', ai.status,
                'period_number', ai.period_number
            ) as instance_details
        FROM survey_assignments sa
        JOIN active_instances ai ON sa.campaign_id = ai.campaign_id
        WHERE sa.user_id = p_user_id
    )
    SELECT 
        ai.id,
        ai.survey_id,
        ai.campaign_id,
        ai.user_id,
        ai.public_access_token,
        ai.last_reminder_sent,
        ai.instance_details as instance,
        (
            SELECT jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'description', s.description,
                'json_data', s.json_data
            )
            FROM surveys s
            WHERE s.id = ai.survey_id
        ) as survey,
        CASE 
            WHEN ai.response_status = 'submitted' THEN 'submitted'
            WHEN ai.response_status = 'in_progress' THEN 'in_progress'
            WHEN (ai.instance_details->>'ends_at')::timestamptz < NOW() THEN 'expired'
            ELSE 'assigned'
        END as status,
        CASE 
            WHEN ai.response_data IS NOT NULL THEN
                jsonb_build_object(
                    'status', ai.response_status,
                    'campaign_instance_id', (ai.instance_details->>'id')::uuid,
                    'data', ai.response_data
                )
            ELSE NULL
        END as response
    FROM assignment_info ai;
END;
$$;

-- Get instance assignment status function
CREATE OR REPLACE FUNCTION get_instance_assignment_status(p_assignment_id UUID, p_instance_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_status text;
    v_instance_end_time timestamp with time zone;
BEGIN
    -- Get instance end time
    SELECT ends_at INTO v_instance_end_time
    FROM campaign_instances
    WHERE id = p_instance_id;

    -- Check if there's a response and get its status
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM survey_responses 
                WHERE assignment_id = p_assignment_id 
                    AND campaign_instance_id = p_instance_id 
                    AND status = 'submitted'
            ) THEN 'completed'
            WHEN EXISTS (
                SELECT 1 
                FROM survey_responses 
                WHERE assignment_id = p_assignment_id 
                    AND campaign_instance_id = p_instance_id 
                    AND status = 'in_progress'
            ) THEN 'in_progress'
            WHEN v_instance_end_time < NOW() THEN 'expired'
            ELSE 'pending'
        END INTO v_status;

    RETURN v_status;
END;
$$;

-- Link response to active instance function
CREATE OR REPLACE FUNCTION link_response_to_active_instance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_campaign_id uuid;
    v_active_instance_id uuid;
    v_existing_response boolean;
BEGIN
    -- Get the campaign_id from the assignment
    SELECT sa.campaign_id INTO v_campaign_id
    FROM survey_assignments sa
    WHERE sa.id = NEW.assignment_id;
    
    -- Check if there's an existing response
    SELECT EXISTS (
        SELECT 1 
        FROM survey_responses 
        WHERE assignment_id = NEW.assignment_id
    ) INTO v_existing_response;
    
    -- Get the active instance id
    SELECT ci.id INTO v_active_instance_id
    FROM campaign_instances ci
    WHERE ci.campaign_id = v_campaign_id
    AND ci.status = 'active'
    ORDER BY ci.period_number DESC
    LIMIT 1;

    -- If no active instance, get the most recent one
    IF v_active_instance_id IS NULL THEN 
        SELECT ci.id INTO v_active_instance_id
        FROM campaign_instances ci
        WHERE ci.campaign_id = v_campaign_id
        AND ci.ends_at < NOW()
        ORDER BY ci.period_number DESC
        LIMIT 1;
    END IF;

    -- Set the campaign_instance_id
    IF v_active_instance_id IS NOT NULL THEN
        NEW.campaign_instance_id = v_active_instance_id;
    END IF;
    
    -- Only set status for new public submissions
    IF NEW.state_data = '{}'::jsonb 
       AND NOT v_existing_response 
       AND NEW.status = 'assigned' THEN
        NEW.status = 'submitted';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Get pending surveys count function
CREATE OR REPLACE FUNCTION get_pending_surveys_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        WITH active_instances AS (
            -- Get instances from non-draft campaigns only
            SELECT 
                ci.id,
                ci.campaign_id
            FROM campaign_instances ci
            JOIN survey_campaigns sc ON ci.campaign_id = sc.id
            WHERE sc.status != 'draft'
            AND ci.status = 'active'
        )
        SELECT COUNT(*)::integer
        FROM survey_assignments sa
        JOIN active_instances ai ON sa.campaign_id = ai.campaign_id
        WHERE sa.user_id = p_user_id
        AND NOT EXISTS (
            SELECT 1 
            FROM survey_responses sr 
            WHERE sr.assignment_id = sa.id 
            AND sr.campaign_instance_id = ai.id
            AND sr.status = 'submitted'
        )
        AND EXISTS (
            SELECT 1 
            FROM campaign_instances ci
            WHERE ci.id = ai.id
            AND ci.ends_at > NOW()
        )
    );
END;
$$;

-- Get survey responses for export function
CREATE OR REPLACE FUNCTION get_survey_responses_for_export(p_campaign_id UUID, p_instance_id UUID)
RETURNS TABLE(
    department TEXT,
    supervisor TEXT,
    response_data JSONB,
    user_name TEXT,
    user_email TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(sbu.name, 'N/A') as department,
        CASE 
            WHEN sup.first_name IS NOT NULL AND sup.last_name IS NOT NULL 
            THEN sup.first_name || ' ' || sup.last_name 
            ELSE 'N/A' 
        END as supervisor,
        sr.response_data,
        CASE 
            WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
            THEN p.first_name || ' ' || p.last_name 
            ELSE 'Anonymous' 
        END as user_name,
        COALESCE(p.email, 'N/A') as user_email,
        sr.status::text,
        sr.created_at,
        sr.updated_at,
        sr.submitted_at
    FROM survey_responses sr
    JOIN survey_assignments sa ON sr.assignment_id = sa.id
    JOIN profiles p ON sa.user_id = p.id
    LEFT JOIN user_sbus us ON us.user_id = p.id AND us.is_primary = true
    LEFT JOIN sbus sbu ON us.sbu_id = sbu.id
    LEFT JOIN user_supervisors usup ON usup.user_id = p.id AND usup.is_primary = true
    LEFT JOIN profiles sup ON usup.supervisor_id = sup.id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    ORDER BY sr.created_at;
END;
$$;

-- Prevent modifying submitted responses function
CREATE OR REPLACE FUNCTION prevent_modifying_submitted_responses()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status = 'submitted' THEN
        RAISE EXCEPTION 'Cannot modify a submitted survey response';
    END IF;
    RETURN NEW;
END;
$$;

-- Get campaign assignments function
CREATE OR REPLACE FUNCTION get_campaign_assignments(p_campaign_id UUID, p_instance_id UUID)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    campaign_id UUID,
    public_access_token UUID,
    last_reminder_sent TIMESTAMPTZ,
    status TEXT,
    user_details JSONB,
    response JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH assignment_info AS (
        SELECT 
            sa.id,
            sa.user_id,
            sa.campaign_id,
            sa.public_access_token,
            sa.last_reminder_sent,
            -- Get the specific instance response if instance_id is provided
            (SELECT sr.response_data 
             FROM survey_responses sr 
             WHERE sr.assignment_id = sa.id 
               AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
             LIMIT 1) as response_data,
            -- Get the response status for the specific instance
            (SELECT sr.status 
             FROM survey_responses sr 
             WHERE sr.assignment_id = sa.id 
               AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
             LIMIT 1) as response_status,
            -- Get instance details if specified
            (SELECT ci.ends_at 
             FROM campaign_instances ci 
             WHERE ci.id = p_instance_id 
               AND ci.campaign_id = sa.campaign_id) as instance_ends_at
        FROM survey_assignments sa
        WHERE sa.campaign_id = p_campaign_id
    )
    SELECT 
        ai.id,
        ai.user_id,
        ai.campaign_id,
        ai.public_access_token,
        ai.last_reminder_sent,
        -- Improved status calculation
        CASE 
            WHEN ai.response_status = 'submitted' THEN 'submitted'
            WHEN ai.response_status = 'in_progress' THEN 'in_progress'
            WHEN p_instance_id IS NOT NULL AND ai.instance_ends_at < NOW() THEN 'expired'
            ELSE 'assigned'
        END as status,
        -- Improved user details structure with null handling
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
            WHERE p.id = ai.user_id
            GROUP BY p.id
        ) as user_details,
        -- Structured response data
        CASE 
            WHEN ai.response_data IS NOT NULL THEN
                jsonb_build_object(
                    'status', ai.response_status,
                    'campaign_instance_id', p_instance_id,
                    'data', ai.response_data
                )
            ELSE NULL
        END as response
    FROM assignment_info ai;
END;
$$;

-- Get campaign instance status distribution function
CREATE OR REPLACE FUNCTION get_campaign_instance_status_distribution(p_campaign_id UUID, p_instance_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH assignment_statuses AS (
        SELECT
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND sr.campaign_instance_id = p_instance_id
                        AND sr.status = 'submitted'
                ) THEN 'submitted'
                WHEN EXISTS (
                    SELECT 1 
                    FROM survey_responses sr 
                    WHERE sr.assignment_id = sa.id 
                        AND sr.campaign_instance_id = p_instance_id
                        AND sr.status = 'in_progress'
                ) THEN 'in_progress'
                WHEN (
                    SELECT ends_at 
                    FROM campaign_instances 
                    WHERE id = p_instance_id
                ) < NOW() THEN 'expired'
                ELSE 'assigned'
            END as status
        FROM survey_assignments sa
        WHERE sa.campaign_id = p_campaign_id
        AND EXISTS (
            SELECT 1 
            FROM survey_campaigns sc 
            WHERE sc.id = sa.campaign_id 
            AND sc.status = 'active'
        )
    )
    SELECT 
        s.status,
        COUNT(*)::bigint as count
    FROM assignment_statuses s
    GROUP BY s.status;
END;
$$;

-- Update instance completion rate function
CREATE OR REPLACE FUNCTION update_instance_completion_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update completion rate for the instance
    UPDATE campaign_instances
    SET completion_rate = calculate_instance_completion_rate(NEW.campaign_instance_id)
    WHERE id = NEW.campaign_instance_id;

    RETURN NEW;
END;
$$;
