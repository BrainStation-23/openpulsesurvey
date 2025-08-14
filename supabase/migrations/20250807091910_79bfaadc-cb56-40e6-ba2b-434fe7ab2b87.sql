
-- Fix smaller database functions to prevent schema poisoning
-- Starting with simple utility functions

-- Fix calculate_progress function
CREATE OR REPLACE FUNCTION public.calculate_progress(
    p_measurement_type text, 
    p_current_value double precision, 
    p_start_value double precision, 
    p_target_value double precision, 
    p_boolean_value boolean
)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_progress float8;
BEGIN
    -- Calculate progress based on measurement type
    CASE p_measurement_type
        WHEN 'boolean' THEN
            v_progress := CASE WHEN p_boolean_value THEN 100.0 ELSE 0.0 END;
        ELSE
            -- For numeric types, calculate percentage of progress
            IF p_target_value = p_start_value THEN
                v_progress := CASE WHEN p_current_value >= p_target_value THEN 100.0 ELSE 0.0 END;
            ELSE
                v_progress := ((p_current_value - p_start_value) / (p_target_value - p_start_value)) * 100.0;
                -- Ensure progress is between 0-100
                v_progress := GREATEST(0.0, LEAST(100.0, v_progress));
            END IF;
    END CASE;
    
    RETURN v_progress;
END;
$function$;

-- Fix get_current_system_version function
CREATE OR REPLACE FUNCTION public.get_current_system_version()
RETURNS TABLE(
    version character varying, 
    released_at timestamp with time zone, 
    applied_at timestamp with time zone, 
    schema_version character varying, 
    frontend_version character varying, 
    edge_functions_version character varying, 
    changelog text, 
    release_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sv.version,
        sv.released_at,
        sv.applied_at,
        sv.schema_version,
        sv.frontend_version,
        sv.edge_functions_version,
        sv.changelog,
        sv.release_notes
    FROM public.system_versions sv
    WHERE sv.is_current = TRUE
    LIMIT 1;
END;
$function$;

-- Fix log_login_attempt function
CREATE OR REPLACE FUNCTION public.log_login_attempt(
    p_user_id uuid, 
    p_email text, 
    p_login_method text, 
    p_success boolean, 
    p_error_message text DEFAULT NULL::text, 
    p_ip_address text DEFAULT NULL::text, 
    p_user_agent text DEFAULT NULL::text, 
    p_device_info jsonb DEFAULT '{}'::jsonb, 
    p_network_info jsonb DEFAULT '{}'::jsonb, 
    p_location_info jsonb DEFAULT '{}'::jsonb, 
    p_session_id text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_log_id uuid;
BEGIN
    INSERT INTO public.login_history (
        user_id,
        email,
        login_method,
        success,
        error_message,
        ip_address,
        user_agent,
        device_info,
        network_info,
        location_info,
        session_id
    ) VALUES (
        p_user_id,
        p_email,
        p_login_method,
        p_success,
        p_error_message,
        p_ip_address,
        p_user_agent,
        p_device_info,
        p_network_info,
        p_location_info,
        p_session_id
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$function$;

-- Fix populate_survey_responses_user_data function
CREATE OR REPLACE FUNCTION public.populate_survey_responses_user_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    updated_count integer := 0;
BEGIN
    -- Update survey_responses with user profile data including age and generation
    UPDATE public.survey_responses sr
    SET 
        primary_sbu_id = (
            SELECT us.sbu_id 
            FROM public.user_sbus us 
            WHERE us.user_id = sr.user_id 
                AND us.is_primary = true 
            LIMIT 1
        ),
        primary_supervisor_id = (
            SELECT usup.supervisor_id 
            FROM public.user_supervisors usup 
            WHERE usup.user_id = sr.user_id 
                AND usup.is_primary = true 
            LIMIT 1
        ),
        gender = p.gender,
        location_id = p.location_id,
        employment_type_id = p.employment_type_id,
        employee_type_id = p.employee_type_id,
        level_id = p.level_id,
        employee_role_id = p.employee_role_id,
        -- Calculate age from date of birth
        age = CASE 
            WHEN p.date_of_birth IS NOT NULL 
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
            ELSE NULL 
        END,
        -- Calculate generation based on birth year
        generation = CASE 
            WHEN p.date_of_birth IS NULL THEN NULL
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1970 AND 1980 THEN 'Generation X'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1981 AND 1996 THEN 'Millennial'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1997 AND 2012 THEN 'Generation Z'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 2013 AND 2025 THEN 'Generation Alpha'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1946 AND 1964 THEN 'Baby Boomer'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1965 AND 1969 THEN 'Generation X'
            ELSE 'Other'
        END
    FROM public.profiles p
    WHERE p.id = sr.user_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$function$;

-- Fix update_system_version function
CREATE OR REPLACE FUNCTION public.update_system_version(
    p_version character varying, 
    p_schema_version character varying, 
    p_frontend_version character varying, 
    p_edge_functions_version character varying, 
    p_changelog text, 
    p_release_notes text, 
    p_migration_scripts text[], 
    p_created_by uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_new_id UUID;
BEGIN
    -- Set all existing versions to not current
    UPDATE public.system_versions
    SET is_current = FALSE;
    
    -- Insert new version
    INSERT INTO public.system_versions (
        version,
        schema_version,
        frontend_version,
        edge_functions_version,
        changelog,
        release_notes,
        migration_scripts,
        created_by,
        is_current
    ) VALUES (
        p_version,
        p_schema_version,
        p_frontend_version,
        p_edge_functions_version,
        p_changelog,
        p_release_notes,
        p_migration_scripts,
        p_created_by,
        TRUE
    ) RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$function$;
