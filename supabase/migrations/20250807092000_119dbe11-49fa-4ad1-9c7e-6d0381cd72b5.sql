
-- Fix the next batch of smaller database functions
-- Continuing with utility and helper functions

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur 
        WHERE ur.user_id = is_admin.user_id 
            AND ur.role = 'admin'
    );
END;
$function$;

-- Fix delete_user_cascade function
CREATE OR REPLACE FUNCTION public.delete_user_cascade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Delete from user_roles
    DELETE FROM public.user_roles WHERE user_id = OLD.id;
    
    -- Delete from profiles
    DELETE FROM public.profiles WHERE id = OLD.id;
    
    -- Delete from user_sbus
    DELETE FROM public.user_sbus WHERE user_id = OLD.id;
    
    -- Delete from user_supervisors
    DELETE FROM public.user_supervisors WHERE user_id = OLD.id OR supervisor_id = OLD.id;
    
    -- Delete from survey_assignments
    DELETE FROM public.survey_assignments WHERE user_id = OLD.id;
    
    -- Delete from survey_responses
    DELETE FROM public.survey_responses WHERE user_id = OLD.id;
    
    -- Delete from login_history
    DELETE FROM public.login_history WHERE user_id = OLD.id;
    
    -- Delete from achievement_progress
    DELETE FROM public.achievement_progress WHERE user_id = OLD.id;
    
    -- Delete from ai_feedback_analysis
    DELETE FROM public.ai_feedback_analysis WHERE supervisor_id = OLD.id;
    
    -- Delete from issue votes and downvotes
    DELETE FROM public.issue_votes WHERE user_id = OLD.id;
    DELETE FROM public.issue_downvotes WHERE user_id = OLD.id;
    
    -- Delete from issues created by user
    DELETE FROM public.issues WHERE created_by = OLD.id;
    
    -- Delete from survey campaigns created by user
    DELETE FROM public.survey_campaigns WHERE created_by = OLD.id;
    
    -- Delete from live survey sessions
    DELETE FROM public.live_survey_sessions WHERE created_by = OLD.id;
    
    -- Delete from shared presentations
    DELETE FROM public.shared_presentations WHERE created_by = OLD.id;
    
    RETURN OLD;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Insert into profiles table
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- Fix create_shared_presentation function
CREATE OR REPLACE FUNCTION public.create_shared_presentation(
    p_campaign_id uuid,
    p_instance_id uuid,
    p_title text,
    p_description text,
    p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_presentation_id uuid;
BEGIN
    INSERT INTO public.shared_presentations (
        campaign_id,
        instance_id,
        title,
        description,
        expires_at,
        created_by
    ) VALUES (
        p_campaign_id,
        p_instance_id,
        p_title,
        p_description,
        p_expires_at,
        auth.uid()
    ) RETURNING id INTO v_presentation_id;
    
    RETURN v_presentation_id;
END;
$function$;

-- Fix get_shared_presentation function
CREATE OR REPLACE FUNCTION public.get_shared_presentation(p_access_token uuid)
RETURNS TABLE(
    id uuid,
    campaign_id uuid,
    instance_id uuid,
    title text,
    description text,
    created_at timestamp with time zone,
    expires_at timestamp with time zone,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.campaign_id,
        sp.instance_id,
        sp.title,
        sp.description,
        sp.created_at,
        sp.expires_at,
        sp.is_active
    FROM public.shared_presentations sp
    WHERE sp.access_token = p_access_token
        AND sp.is_active = true
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW());
END;
$function$;
