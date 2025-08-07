
-- Fix the next batch of smaller database functions
-- Continuing with trigger and utility functions

-- Fix update_vote_count function
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_vote_count integer;
    v_downvote_count integer;
BEGIN
    -- Count votes for the issue
    SELECT COUNT(*) INTO v_vote_count
    FROM public.issue_votes
    WHERE issue_id = COALESCE(NEW.issue_id, OLD.issue_id);
    
    -- Count downvotes for the issue
    SELECT COUNT(*) INTO v_downvote_count
    FROM public.issue_downvotes
    WHERE issue_id = COALESCE(NEW.issue_id, OLD.issue_id);
    
    -- Update the issue with new counts
    UPDATE public.issues
    SET 
        vote_count = v_vote_count,
        downvote_count = v_downvote_count
    WHERE id = COALESCE(NEW.issue_id, OLD.issue_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix update_campaign_instance_status function
CREATE OR REPLACE FUNCTION public.update_campaign_instance_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_updated_to_active integer := 0;
    v_updated_to_completed integer := 0;
BEGIN
    -- Update instances that should be active
    UPDATE public.campaign_instances
    SET status = 'active'
    WHERE status = 'upcoming'
        AND starts_at <= NOW()
        AND ends_at > NOW();
    
    GET DIAGNOSTICS v_updated_to_active = ROW_COUNT;
    
    -- Update instances that should be completed
    UPDATE public.campaign_instances
    SET status = 'completed'
    WHERE status = 'active'
        AND ends_at <= NOW();
    
    GET DIAGNOSTICS v_updated_to_completed = ROW_COUNT;
    
    -- Log the updates
    IF v_updated_to_active > 0 OR v_updated_to_completed > 0 THEN
        INSERT INTO public.campaign_instance_status_logs (
            updated_to_active,
            updated_to_completed,
            run_at,
            details
        ) VALUES (
            v_updated_to_active,
            v_updated_to_completed,
            NOW(),
            jsonb_build_object(
                'function', 'update_campaign_instance_status',
                'updated_to_active', v_updated_to_active,
                'updated_to_completed', v_updated_to_completed
            )
        );
    END IF;
END;
$function$;

-- Fix activate_campaign_instances function
CREATE OR REPLACE FUNCTION public.activate_campaign_instances()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_count integer := 0;
BEGIN
    UPDATE public.campaign_instances
    SET status = 'active'
    WHERE status = 'upcoming'
        AND starts_at <= NOW()
        AND ends_at > NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$function$;

-- Fix complete_campaign_instances function
CREATE OR REPLACE FUNCTION public.complete_campaign_instances()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_count integer := 0;
BEGIN
    UPDATE public.campaign_instances
    SET status = 'completed'
    WHERE status = 'active'
        AND ends_at <= NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$function$;

-- Fix update_survey_response_user_data function
CREATE OR REPLACE FUNCTION public.update_survey_response_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Update the survey response with user profile data
    NEW.primary_sbu_id := (
        SELECT us.sbu_id 
        FROM public.user_sbus us 
        WHERE us.user_id = NEW.user_id 
            AND us.is_primary = true 
        LIMIT 1
    );
    
    NEW.primary_supervisor_id := (
        SELECT usup.supervisor_id 
        FROM public.user_supervisors usup 
        WHERE usup.user_id = NEW.user_id 
            AND usup.is_primary = true 
        LIMIT 1
    );
    
    -- Get profile data
    SELECT 
        p.gender,
        p.location_id,
        p.employment_type_id,
        p.employee_type_id,
        p.level_id,
        p.employee_role_id,
        CASE 
            WHEN p.date_of_birth IS NOT NULL 
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
            ELSE NULL 
        END,
        CASE 
            WHEN p.date_of_birth IS NULL THEN NULL
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1970 AND 1980 THEN 'Generation X'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1981 AND 1996 THEN 'Millennial'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1997 AND 2012 THEN 'Generation Z'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 2013 AND 2025 THEN 'Generation Alpha'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1946 AND 1964 THEN 'Baby Boomer'
            WHEN EXTRACT(YEAR FROM p.date_of_birth) BETWEEN 1965 AND 1969 THEN 'Generation X'
            ELSE 'Other'
        END
    INTO 
        NEW.gender,
        NEW.location_id,
        NEW.employment_type_id,
        NEW.employee_type_id,
        NEW.level_id,
        NEW.employee_role_id,
        NEW.age,
        NEW.generation
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
    
    RETURN NEW;
END;
$function$;

-- Fix update_last_reminder_sent function
CREATE OR REPLACE FUNCTION public.update_last_reminder_sent(assignment_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    UPDATE public.survey_assignments
    SET last_reminder_sent = NOW()
    WHERE id = ANY(assignment_ids);
END;
$function$;
