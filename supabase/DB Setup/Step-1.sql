

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."achievement_category" AS ENUM (
    'survey_completion',
    'response_rate',
    'streak',
    'quality',
    'special_event'
);


ALTER TYPE "public"."achievement_category" OWNER TO "postgres";


CREATE TYPE "public"."achievement_condition_type" AS ENUM (
    'survey_count',
    'response_rate',
    'streak_days',
    'response_quality',
    'event_participation'
);


ALTER TYPE "public"."achievement_condition_type" OWNER TO "postgres";


CREATE TYPE "public"."achievement_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."achievement_status" OWNER TO "postgres";


CREATE TYPE "public"."achievement_type" AS ENUM (
    'survey_completion',
    'response_rate',
    'streak',
    'campaign_completion'
);


ALTER TYPE "public"."achievement_type" OWNER TO "postgres";


CREATE TYPE "public"."assignment_status" AS ENUM (
    'pending',
    'completed',
    'expired'
);


ALTER TYPE "public"."assignment_status" OWNER TO "postgres";


CREATE TYPE "public"."campaign_status" AS ENUM (
    'draft',
    'active',
    'completed',
    'archived'
);


ALTER TYPE "public"."campaign_status" OWNER TO "postgres";


CREATE TYPE "public"."config_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."config_status" OWNER TO "postgres";


CREATE TYPE "public"."contact_message_status" AS ENUM (
    'pending',
    'sent',
    'error',
    'partially_sent'
);


ALTER TYPE "public"."contact_message_status" OWNER TO "postgres";


CREATE TYPE "public"."cron_job_type" AS ENUM (
    'instance_activation',
    'instance_due_time',
    'campaign_end'
);


ALTER TYPE "public"."cron_job_type" OWNER TO "postgres";


CREATE TYPE "public"."email_provider" AS ENUM (
    'resend'
);


ALTER TYPE "public"."email_provider" OWNER TO "postgres";


CREATE TYPE "public"."employee_role_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."employee_role_status" OWNER TO "postgres";


CREATE TYPE "public"."employee_type_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."employee_type_status" OWNER TO "postgres";


CREATE TYPE "public"."employment_type_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."employment_type_status" OWNER TO "postgres";


CREATE TYPE "public"."gender_type" AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE "public"."gender_type" OWNER TO "postgres";


CREATE TYPE "public"."grading_criteria_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."grading_criteria_status" OWNER TO "postgres";


CREATE TYPE "public"."instance_status" AS ENUM (
    'upcoming',
    'active',
    'completed'
);


ALTER TYPE "public"."instance_status" OWNER TO "postgres";


CREATE TYPE "public"."issue_board_status" AS ENUM (
    'active',
    'disabled'
);


ALTER TYPE "public"."issue_board_status" OWNER TO "postgres";


CREATE TYPE "public"."issue_status" AS ENUM (
    'open',
    'closed'
);


ALTER TYPE "public"."issue_status" OWNER TO "postgres";


CREATE TYPE "public"."level_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."level_status" OWNER TO "postgres";


CREATE TYPE "public"."profile_status" AS ENUM (
    'active',
    'disabled'
);


ALTER TYPE "public"."profile_status" OWNER TO "postgres";


CREATE TYPE "public"."prompt_category" AS ENUM (
    'general_analysis',
    'demographic_insights',
    'response_patterns',
    'improvement_suggestions',
    'action_items'
);


ALTER TYPE "public"."prompt_category" OWNER TO "postgres";


CREATE TYPE "public"."prompt_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."prompt_status" OWNER TO "postgres";


CREATE TYPE "public"."recurring_frequency" AS ENUM (
    'one_time',
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);


ALTER TYPE "public"."recurring_frequency" OWNER TO "postgres";


CREATE TYPE "public"."response_status" AS ENUM (
    'assigned',
    'in_progress',
    'submitted',
    'expired'
);


ALTER TYPE "public"."response_status" OWNER TO "postgres";


CREATE TYPE "public"."scenario_status" AS ENUM (
    'active',
    'inactive',
    'draft'
);


ALTER TYPE "public"."scenario_status" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'initial',
    'active',
    'paused',
    'ended'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."survey_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."survey_status" OWNER TO "postgres";


CREATE TYPE "public"."user_deletion_result" AS (
	"success" boolean,
	"error_message" "text"
);


ALTER TYPE "public"."user_deletion_result" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_assignments INTEGER;
    completed_responses INTEGER;
    completion_rate NUMERIC;
    instance_record RECORD;
BEGIN
    -- Get instance info first
    SELECT * INTO instance_record
    FROM campaign_instances
    WHERE id = instance_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Get total assignments for this campaign
    SELECT COUNT(DISTINCT sa.id)
    INTO total_assignments
    FROM survey_assignments sa
    WHERE sa.campaign_id = instance_record.campaign_id
    AND EXISTS (
        -- Only count assignments that were active during this instance's period
        SELECT 1 
        FROM campaign_instances ci
        WHERE ci.id = instance_id
        AND ci.campaign_id = sa.campaign_id
    );

    -- Get completed responses for this instance
    -- Count both submitted responses and expired ones if instance is completed
    SELECT COUNT(DISTINCT 
        CASE 
            WHEN sr.status = 'submitted' 
            OR (instance_record.status = 'completed' AND sr.status = 'expired')
            THEN sr.assignment_id 
        END
    )
    INTO completed_responses
    FROM survey_responses sr
    WHERE sr.campaign_instance_id = instance_id;

    -- Calculate completion rate
    IF total_assignments = 0 THEN
        completion_rate := 0;
    ELSE
        completion_rate := (completed_responses::NUMERIC / total_assignments::NUMERIC) * 100;
    END IF;

    -- Round to 1 decimal place
    RETURN ROUND(completion_rate, 1);
END;
$$;


ALTER FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_last_submission timestamp with time zone;
    v_current_streak integer;
BEGIN
    -- Get last submission before this one
    SELECT MAX(submitted_at)
    INTO v_last_submission
    FROM survey_responses
    WHERE user_id = p_user_id
    AND status = 'submitted'
    AND submitted_at < CURRENT_TIMESTAMP;

    -- Calculate current streak
    IF v_last_submission IS NULL OR v_last_submission < CURRENT_DATE - INTERVAL '1 day' THEN
        -- First submission or streak broken, start at 1
        v_current_streak := 1;
    ELSE
        -- Continue existing streak
        SELECT COUNT(DISTINCT DATE(submitted_at))
        INTO v_current_streak
        FROM survey_responses
        WHERE user_id = p_user_id
        AND status = 'submitted'
        AND submitted_at > CURRENT_DATE - INTERVAL '30 days'
        AND DATE(submitted_at) >= DATE(v_last_submission);
    END IF;

    -- Define survey stats CTE first, then use it for both operations
    WITH survey_stats AS (
        SELECT 
            COUNT(*) as completed_surveys,
            AVG(CASE WHEN sr.status = 'submitted' THEN 1 ELSE 0 END) * 100 as response_rate,
            COUNT(DISTINCT sa.campaign_id) as completed_campaigns
        FROM survey_responses sr
        JOIN survey_assignments sa ON sr.assignment_id = sa.id
        WHERE sr.user_id = p_user_id
        AND sr.status = 'submitted'
    )
    -- Insert new achievements for eligible ones using the stats CTE
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    SELECT 
        p_user_id,
        a.id,
        jsonb_build_object(
            'type', a.achievement_type,
            'current_value', 
            CASE 
                WHEN a.achievement_type = 'survey_completion' THEN ss.completed_surveys
                WHEN a.achievement_type = 'response_rate' THEN ss.response_rate
                WHEN a.achievement_type = 'streak' THEN v_current_streak
                WHEN a.achievement_type = 'campaign_completion' THEN ss.completed_campaigns
            END
        ) as progress
    FROM achievements a
    CROSS JOIN survey_stats ss
    LEFT JOIN user_achievements ua 
        ON ua.achievement_id = a.id 
        AND ua.user_id = p_user_id
    WHERE ua.id IS NULL  -- Only unearned achievements
    AND (
        (a.achievement_type = 'survey_completion' 
         AND ss.completed_surveys >= (a.condition_value->>'required_count')::int)
        OR
        (a.achievement_type = 'response_rate' 
         AND ss.response_rate >= (a.condition_value->>'required_rate')::numeric)
        OR
        (a.achievement_type = 'streak' 
         AND v_current_streak >= (a.condition_value->>'required_days')::int)
        OR
        (a.achievement_type = 'campaign_completion' 
         AND ss.completed_campaigns >= (a.condition_value->>'required_count')::int)
    );

    -- Update achievement progress using the same stats CTE
    WITH survey_stats AS (
        SELECT 
            COUNT(*) as completed_surveys,
            AVG(CASE WHEN sr.status = 'submitted' THEN 1 ELSE 0 END) * 100 as response_rate,
            COUNT(DISTINCT sa.campaign_id) as completed_campaigns
        FROM survey_responses sr
        JOIN survey_assignments sa ON sr.assignment_id = sa.id
        WHERE sr.user_id = p_user_id
        AND sr.status = 'submitted'
    )
    INSERT INTO achievement_progress (user_id, achievement_id, current_value)
    SELECT 
        p_user_id,
        a.id,
        jsonb_build_object(
            'type', a.achievement_type,
            'value', 
            CASE 
                WHEN a.achievement_type = 'survey_completion' THEN ss.completed_surveys
                WHEN a.achievement_type = 'response_rate' THEN ss.response_rate
                WHEN a.achievement_type = 'streak' THEN v_current_streak
                WHEN a.achievement_type = 'campaign_completion' THEN ss.completed_campaigns
            END
        )
    FROM achievements a
    CROSS JOIN survey_stats ss
    WHERE NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.achievement_id = a.id 
        AND ua.user_id = p_user_id
    )
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
        current_value = EXCLUDED.current_value,
        updated_at = NOW();

    -- Log achievement check
    RAISE NOTICE 'Checked achievements for user %, current streak: %', p_user_id, v_current_streak;
END;
$$;


ALTER FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_profile RECORD;
    v_has_access BOOLEAN;
BEGIN
    -- Get user profile information
    SELECT 
        p.*,
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = p_user_id 
            AND ur.role = 'admin'
        ) as is_admin
    INTO v_profile
    FROM profiles p
    WHERE p.id = p_user_id;

    -- Admins always have access
    IF v_profile.is_admin THEN
        RETURN TRUE;
    END IF;

    -- Check if user matches any permission criteria
    SELECT EXISTS (
        SELECT 1
        FROM issue_board_permissions ibp
        WHERE ibp.board_id = p_board_id
        AND (
            -- Match any of the user's attributes using arrays
            (ibp.sbu_ids IS NULL OR ibp.sbu_ids = '{}' OR 
             EXISTS (SELECT 1 FROM user_sbus us WHERE us.user_id = p_user_id AND us.sbu_id = ANY(ibp.sbu_ids)))
            AND
            (ibp.location_ids IS NULL OR ibp.location_ids = '{}' OR v_profile.location_id = ANY(ibp.location_ids))
            AND
            (ibp.level_ids IS NULL OR ibp.level_ids = '{}' OR v_profile.level_id = ANY(ibp.level_ids))
            AND
            (ibp.employment_type_ids IS NULL OR ibp.employment_type_ids = '{}' OR v_profile.employment_type_id = ANY(ibp.employment_type_ids))
            AND
            (ibp.employee_type_ids IS NULL OR ibp.employee_type_ids = '{}' OR v_profile.employee_type_id = ANY(ibp.employee_type_ids))
            AND
            (ibp.employee_role_ids IS NULL OR ibp.employee_role_ids = '{}' OR v_profile.employee_role_id = ANY(ibp.employee_role_ids))
        )
        AND (
            (p_access_type = 'view' AND ibp.can_view) OR
            (p_access_type = 'create' AND ibp.can_create) OR
            (p_access_type = 'vote' AND ibp.can_vote)
        )
    ) INTO v_has_access;

    RETURN v_has_access;
END;
$$;


ALTER FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_campaign_cron_jobs"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_job RECORD;
BEGIN
    -- Unschedule all jobs for this campaign
    FOR v_job IN 
        SELECT * FROM campaign_cron_jobs 
        WHERE campaign_id = p_campaign_id
        AND is_active = true
    LOOP
        PERFORM cron.unschedule(v_job.job_name);
        
        -- Log successful cleanup
        INSERT INTO campaign_cron_job_logs (
            campaign_id,
            job_name,
            status
        ) VALUES (
            p_campaign_id,
            v_job.job_name,
            'CLEANUP_SUCCESS'
        );
    END LOOP;
    
    -- Mark all jobs as inactive
    UPDATE campaign_cron_jobs
    SET 
        is_active = false,
        updated_at = timezone('utc', NOW())
    WHERE campaign_id = p_campaign_id;
END;
$$;


ALTER FUNCTION "public"."cleanup_campaign_cron_jobs"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_vote_count"("issue_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE issues
  SET vote_count = GREATEST(0, vote_count - 1)
  WHERE id = issue_id;
END;
$$;


ALTER FUNCTION "public"."decrement_vote_count"("issue_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") RETURNS "public"."user_deletion_result"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    result user_deletion_result;
BEGIN
    -- Start transaction
    BEGIN
        -- Step 1: Delete refresh tokens
        DELETE FROM auth.refresh_tokens WHERE user_id = in_user_id;
        
        -- Step 2: Delete sessions
        DELETE FROM auth.sessions WHERE user_id = in_user_id;
        
        -- Step 3: Delete MFA factors
        DELETE FROM auth.mfa_factors WHERE user_id = in_user_id;
        
        -- Step 4: Delete identities
        DELETE FROM auth.identities WHERE user_id = in_user_id;
        
        -- Step 5: Delete user from auth.users
        DELETE FROM auth.users WHERE id = in_user_id;
        
        -- If we get here, everything succeeded
        result.success := true;
        result.error_message := null;
        
        RETURN result;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error and return failure
        result.success := false;
        result.error_message := SQLERRM;
        
        RETURN result;
    END;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_campaign_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'cron'
    AS $$
DECLARE
    v_job RECORD;
BEGIN
    -- Loop through and unschedule all jobs for this campaign
    FOR v_job IN 
        SELECT * FROM campaign_cron_jobs 
        WHERE campaign_id = OLD.id
        AND is_active = true
    LOOP
        BEGIN
            -- Attempt to unschedule each cron job
            PERFORM cron.unschedule(v_job.job_name);
            
            -- Log successful cleanup
            INSERT INTO campaign_cron_job_logs (
                campaign_id,
                job_name,
                status
            ) VALUES (
                OLD.id,
                v_job.job_name,
                'CLEANUP_SUCCESS'
            );
        EXCEPTION WHEN OTHERS THEN
            -- Log the error but continue with deletion
            INSERT INTO campaign_cron_job_logs (
                campaign_id,
                job_name,
                status,
                error_message
            ) VALUES (
                OLD.id,
                v_job.job_name,
                'CLEANUP_WARNING',
                'Failed to unschedule cron job: ' || SQLERRM
            );
            -- Don't raise exception, just log warning
            RAISE WARNING 'Failed to unschedule cron job: %', SQLERRM;
        END;
    END LOOP;
    
    -- Delete all related data explicitly
    DELETE FROM campaign_instances WHERE campaign_id = OLD.id;
    DELETE FROM survey_assignments WHERE campaign_id = OLD.id;
    DELETE FROM campaign_cron_jobs WHERE campaign_id = OLD.id;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_campaign_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_survey_assignment"("p_assignment_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_deleted_responses INT;
    v_assignment_exists BOOLEAN;
    v_campaign_instance_ids UUID[];
    instance_id UUID; -- Declare the loop variable
BEGIN
    -- Check if assignment exists
    SELECT EXISTS (
        SELECT 1 FROM survey_assignments WHERE id = p_assignment_id
    ) INTO v_assignment_exists;

    IF NOT v_assignment_exists THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Assignment not found',
            'deleted_responses', 0
        );
    END IF;

    -- Get affected instance IDs before deletion
    SELECT ARRAY_AGG(DISTINCT campaign_instance_id)
    INTO v_campaign_instance_ids
    FROM survey_responses
    WHERE assignment_id = p_assignment_id;

    -- Delete associated responses and count them
    WITH deleted_responses AS (
        DELETE FROM survey_responses 
        WHERE assignment_id = p_assignment_id
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_responses FROM deleted_responses;

    -- Delete the assignment
    DELETE FROM survey_assignments WHERE id = p_assignment_id;

    -- Update completion rates for all affected instances
    IF v_campaign_instance_ids IS NOT NULL THEN
        FOREACH instance_id IN ARRAY v_campaign_instance_ids
        LOOP
            UPDATE campaign_instances
            SET completion_rate = calculate_instance_completion_rate(instance_id)
            WHERE id = instance_id;
        END LOOP;
    END IF;

    -- Return deletion results
    RETURN json_build_object(
        'success', true,
        'message', 'Assignment and associated data deleted successfully',
        'deleted_responses', v_deleted_responses
    );
END;
$$;


ALTER FUNCTION "public"."delete_survey_assignment"("p_assignment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Log the start of deletion process
    RAISE NOTICE 'Starting cascade deletion for user ID: %', OLD.id;
    
    -- Delete user_roles
    DELETE FROM user_roles WHERE user_id = OLD.id;
    
    -- Delete user_sbus
    DELETE FROM user_sbus WHERE user_id = OLD.id;
    
    -- Delete user_supervisors where user is either the supervisor or supervisee
    DELETE FROM user_supervisors WHERE user_id = OLD.id OR supervisor_id = OLD.id;
    
    -- Delete survey_assignments
    DELETE FROM survey_assignments WHERE user_id = OLD.id;
    
    -- Delete survey_responses
    DELETE FROM survey_responses WHERE user_id = OLD.id;
    
    -- Update SBUs where user is head (set head_id to null)
    UPDATE sbus SET head_id = NULL WHERE head_id = OLD.id;
    
    -- First, update the profile to remove all foreign key references
    UPDATE profiles 
    SET 
        employee_role_id = NULL,
        employee_type_id = NULL,
        employment_type_id = NULL,
        level_id = NULL,
        location_id = NULL
    WHERE id = OLD.id;
    
    -- Finally, delete the profile
    DELETE FROM profiles WHERE id = OLD.id;
    
    RAISE NOTICE 'Completed cascade deletion for user ID: %', OLD.id;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_user_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_all_instance_completion_rates"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    instance_record RECORD;
BEGIN
    FOR instance_record IN 
        SELECT id 
        FROM campaign_instances
    LOOP
        UPDATE campaign_instances
        SET completion_rate = calculate_instance_completion_rate(instance_record.id)
        WHERE id = instance_record.id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."fix_all_instance_completion_rates"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_missing_campaign_jobs"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_campaign RECORD;
BEGIN
    FOR v_campaign IN 
        SELECT id 
        FROM survey_campaigns 
        WHERE status = 'active' 
        AND NOT EXISTS (
            SELECT 1 
            FROM campaign_cron_jobs 
            WHERE campaign_id = survey_campaigns.id
        )
    LOOP
        BEGIN
            PERFORM schedule_campaign_jobs(v_campaign.id);
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with next campaign
            RAISE NOTICE 'Failed to schedule jobs for campaign %: %', v_campaign.id, SQLERRM;
        END;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."fix_missing_campaign_jobs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_campaign_cron_schedule"("p_timestamp" timestamp with time zone, "p_recurring_frequency" "text", "p_job_type" "public"."cron_job_type") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_minute INT;
    v_hour INT;
    v_schedule text;
BEGIN    
    -- Extract time components from the timestamp
    v_minute := EXTRACT(MINUTE FROM p_timestamp);
    v_hour := EXTRACT(HOUR FROM p_timestamp);
    
    CASE p_job_type
        WHEN 'instance_activation' THEN
            -- Schedule based on frequency using the start time
            CASE p_recurring_frequency
                WHEN 'daily' THEN
                    v_schedule := format('%s %s * * *', v_minute, v_hour);
                WHEN 'weekly' THEN
                    v_schedule := format('%s %s * * %s', 
                        v_minute, 
                        v_hour,
                        EXTRACT(DOW FROM p_timestamp)
                    );
                WHEN 'monthly' THEN
                    v_schedule := format('%s %s %s * *', 
                        v_minute, 
                        v_hour, 
                        EXTRACT(DAY FROM p_timestamp)
                    );
                WHEN 'quarterly' THEN
                    v_schedule := format('%s %s %s %s *',
                        v_minute,
                        v_hour,
                        EXTRACT(DAY FROM p_timestamp),
                        array_to_string(ARRAY[1,4,7,10], ',')
                    );
                WHEN 'yearly' THEN
                    v_schedule := format('%s %s %s %s *',
                        v_minute,
                        v_hour,
                        EXTRACT(DAY FROM p_timestamp),
                        EXTRACT(MONTH FROM p_timestamp)
                    );
                ELSE
                    v_schedule := format('%s %s * * *', v_minute, v_hour);
            END CASE;
            
        WHEN 'instance_due_time' THEN
            -- Use the same frequency logic as instance activation
            CASE p_recurring_frequency
                WHEN 'daily' THEN
                    v_schedule := format('%s %s * * *', v_minute, v_hour);
                WHEN 'weekly' THEN
                    v_schedule := format('%s %s * * %s', 
                        v_minute, 
                        v_hour,
                        EXTRACT(DOW FROM p_timestamp)
                    );
                WHEN 'monthly' THEN
                    v_schedule := format('%s %s %s * *', 
                        v_minute, 
                        v_hour, 
                        EXTRACT(DAY FROM p_timestamp)
                    );
                WHEN 'quarterly' THEN
                    v_schedule := format('%s %s %s %s *',
                        v_minute,
                        v_hour,
                        EXTRACT(DAY FROM p_timestamp),
                        array_to_string(ARRAY[1,4,7,10], ',')
                    );
                WHEN 'yearly' THEN
                    v_schedule := format('%s %s %s %s *',
                        v_minute,
                        v_hour,
                        EXTRACT(DAY FROM p_timestamp),
                        EXTRACT(MONTH FROM p_timestamp)
                    );
                ELSE
                    v_schedule := format('%s %s * * *', v_minute, v_hour);
            END CASE;
            
        WHEN 'campaign_end' THEN
            -- Use the campaign end time directly
            v_schedule := format('%s %s %s %s *',
                v_minute,
                v_hour,
                EXTRACT(DAY FROM p_timestamp),
                EXTRACT(MONTH FROM p_timestamp)
            );
    END CASE;
    
    RETURN v_schedule;
END;
$$;


ALTER FUNCTION "public"."generate_campaign_cron_schedule"("p_timestamp" timestamp with time zone, "p_recurring_frequency" "text", "p_job_type" "public"."cron_job_type") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_initial_instances"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_start timestamptz;
  current_end timestamptz;
  default_end_time timestamptz;
  period_num integer := 1;
  target_day integer;
  target_hour integer;
  target_minute integer;
  target_second integer;
BEGIN
  -- Set default end time if not provided
  default_end_time := timezone('utc', (NOW() AT TIME ZONE 'UTC')::date + interval '23 hours 59 minutes 59 seconds');
  
  IF NEW.instance_end_time IS NULL THEN
    NEW.instance_end_time := default_end_time;
  END IF;

  -- Store the target day and time components
  target_day := extract(day from NEW.starts_at);
  target_hour := extract(hour from NEW.starts_at);
  target_minute := extract(minute from NEW.starts_at);
  target_second := extract(second from NEW.starts_at);

  -- For one-time campaigns
  IF NOT NEW.is_recurring THEN
    INSERT INTO campaign_instances (
      campaign_id,
      period_number,
      starts_at,
      ends_at,
      status
    ) VALUES (
      NEW.id,
      1,
      NEW.starts_at,
      COALESCE(NEW.ends_at, NEW.starts_at + interval '1 day'),
      CASE 
        WHEN NEW.starts_at <= NOW() AND (NEW.ends_at IS NULL OR NEW.ends_at > NOW()) THEN 'active'::instance_status
        WHEN NEW.starts_at > NOW() THEN 'upcoming'::instance_status
        ELSE 'completed'::instance_status
      END
    );
    RETURN NEW;
  END IF;

  -- For recurring campaigns
  current_start := NEW.starts_at;
  
  -- Generate instances
  WHILE current_start < NEW.ends_at LOOP
    -- Calculate instance end date based on duration
    current_end := current_start + (NEW.instance_duration_days || ' days')::interval;
    
    -- Then set the specific end time from instance_end_time
    current_end := date_trunc('day', current_end) + 
                   extract(hour from NEW.instance_end_time) * interval '1 hour' + 
                   extract(minute from NEW.instance_end_time) * interval '1 minute';

    -- Insert instance
    INSERT INTO campaign_instances (
      campaign_id,
      period_number,
      starts_at,
      ends_at,
      status
    ) VALUES (
      NEW.id,
      period_num,
      current_start,
      current_end,
      CASE 
        WHEN current_start <= NOW() AND current_end > NOW() THEN 'active'::instance_status
        WHEN current_start > NOW() THEN 'upcoming'::instance_status
        ELSE 'completed'::instance_status
      END
    );

    -- Calculate next period start based on frequency
    CASE NEW.recurring_frequency
      WHEN 'daily' THEN
        current_start := current_start + interval '1 day';
      WHEN 'weekly' THEN
        current_start := current_start + interval '7 days';
      WHEN 'monthly' THEN
        -- Move to next month while preserving the target day
        current_start := date_trunc('month', current_start + interval '1 month') +
                        (target_day - 1) * interval '1 day' +
                        target_hour * interval '1 hour' +
                        target_minute * interval '1 minute' +
                        target_second * interval '1 second';
        
        -- If we overshot the month (e.g., trying for 31st in a 30-day month),
        -- adjust to the last day of the target month
        IF extract(month from current_start) != extract(month from date_trunc('month', current_start)) THEN
          current_start := date_trunc('month', current_start) - interval '1 day' +
                          target_hour * interval '1 hour' +
                          target_minute * interval '1 minute' +
                          target_second * interval '1 second';
        END IF;
      WHEN 'quarterly' THEN
        -- Move 3 months while preserving the target day
        current_start := date_trunc('month', current_start + interval '3 months') +
                        (target_day - 1) * interval '1 day' +
                        target_hour * interval '1 hour' +
                        target_minute * interval '1 minute' +
                        target_second * interval '1 second';
        
        -- Handle month length differences
        IF extract(month from current_start) != extract(month from date_trunc('month', current_start)) THEN
          current_start := date_trunc('month', current_start) - interval '1 day' +
                          target_hour * interval '1 hour' +
                          target_minute * interval '1 minute' +
                          target_second * interval '1 second';
        END IF;
      WHEN 'yearly' THEN
        -- Move to next year while preserving the target day
        current_start := date_trunc('month', current_start + interval '1 year') +
                        (target_day - 1) * interval '1 day' +
                        target_hour * interval '1 hour' +
                        target_minute * interval '1 minute' +
                        target_second * interval '1 second';
        
        -- Handle February 29th in leap years
        IF extract(month from current_start) != extract(month from date_trunc('month', current_start)) THEN
          current_start := date_trunc('month', current_start) - interval '1 day' +
                          target_hour * interval '1 hour' +
                          target_minute * interval '1 minute' +
                          target_second * interval '1 second';
        END IF;
    END CASE;

    -- Increment period number
    period_num := period_num + 1;

    -- Exit if we've passed the end date
    IF current_start >= NEW.ends_at THEN
      EXIT;
    END IF;

    -- Safety check to prevent infinite loops
    IF period_num > 1000 THEN
      RAISE EXCEPTION 'Too many instances generated. Check campaign frequency and duration.';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_initial_instances"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_public_access_token"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only generate a new token if one isn't already set
    IF NEW.public_access_token IS NULL THEN
        NEW.public_access_token := gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_public_access_token"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assignment_instance_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") RETURNS "public"."assignment_status"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_status assignment_status;
  v_instance_end_time timestamp with time zone;
BEGIN
  -- Get the instance end time
  SELECT ends_at INTO v_instance_end_time
  FROM campaign_instances
  WHERE id = p_instance_id;

  -- Check if there's a response for this assignment in this instance
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM survey_responses 
        WHERE assignment_id = p_assignment_id 
        AND campaign_instance_id = p_instance_id
      ) THEN 'completed'::assignment_status
      WHEN v_instance_end_time < NOW() THEN 'expired'::assignment_status
      ELSE 'pending'::assignment_status
    END INTO v_status;

  RETURN v_status;
END;
$$;


ALTER FUNCTION "public"."get_assignment_instance_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_campaign_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_result jsonb;
    v_campaign_info jsonb;
    v_instance_info jsonb;
    v_location_data jsonb;
    v_sbu_data jsonb;
    v_instance_stats jsonb;
BEGIN
    -- Get campaign basic info (without assignments/responses counts)
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

    -- Get location statistics for specific instance
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

    -- Get SBU statistics for specific instance
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

    -- Get detailed instance statistics
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


ALTER FUNCTION "public"."get_campaign_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "campaign_id" "uuid", "public_access_token" "uuid", "last_reminder_sent" timestamp with time zone, "status" "text", "user_details" "jsonb", "response" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") IS 'Returns campaign assignments with proper status calculation and response handling';



CREATE OR REPLACE FUNCTION "public"."get_campaign_instance_status_distribution"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("status" "text", "count" bigint)
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_campaign_instance_status_distribution"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_result jsonb;
    v_instance_info jsonb;
    v_completion_trends jsonb;
    v_demographic_stats jsonb;
    v_question_stats jsonb;
BEGIN
    -- Get instance statistics
    SELECT jsonb_build_object(
        'completion_rate', ci.completion_rate,
        'total_assignments', COUNT(DISTINCT sa.id),
        'completed_responses', COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END)
    )
    INTO v_instance_info
    FROM campaign_instances ci
    LEFT JOIN survey_assignments sa ON sa.campaign_id = ci.campaign_id
    LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
        AND sr.campaign_instance_id = ci.id
    WHERE ci.id = p_instance_id
    GROUP BY ci.id, ci.completion_rate;

    -- Get completion trends (daily response counts) using CTE to avoid nested aggregates
    WITH daily_counts AS (
        SELECT 
            date_trunc('day', sr.submitted_at)::date as response_date,
            COUNT(*) as response_count
        FROM survey_responses sr
        WHERE sr.campaign_instance_id = p_instance_id
        AND sr.status = 'submitted'
        GROUP BY date_trunc('day', sr.submitted_at)::date
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', response_date,
            'responses', response_count
        )
        ORDER BY response_date
    )
    INTO v_completion_trends
    FROM daily_counts;

    -- Get demographic statistics
    WITH demographic_stats AS (
        -- SBU (Department) stats
        SELECT 
            'department' as metric,
            jsonb_agg(
                jsonb_build_object(
                    'name', s.name,
                    'total_assigned', COUNT(DISTINCT sa.id),
                    'completed', COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END),
                    'response_rate', ROUND(
                        COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END)::numeric 
                        / NULLIF(COUNT(DISTINCT sa.id), 0) * 100, 
                        1
                    )
                )
            ) as stats
        FROM sbus s
        JOIN user_sbus us ON us.sbu_id = s.id
        JOIN survey_assignments sa ON sa.user_id = us.user_id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
            AND sr.campaign_instance_id = p_instance_id
        WHERE us.is_primary = true
        GROUP BY s.id

        UNION ALL

        -- Gender stats
        SELECT 
            'gender' as metric,
            jsonb_agg(
                jsonb_build_object(
                    'gender', COALESCE(p.gender, 'Not Specified'),
                    'total_assigned', COUNT(DISTINCT sa.id),
                    'completed', COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END),
                    'response_rate', ROUND(
                        COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END)::numeric 
                        / NULLIF(COUNT(DISTINCT sa.id), 0) * 100, 
                        1
                    )
                )
            ) as stats
        FROM profiles p
        JOIN survey_assignments sa ON sa.user_id = p.id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
            AND sr.campaign_instance_id = p_instance_id
        GROUP BY p.gender

        UNION ALL

        -- Location stats
        SELECT 
            'location' as metric,
            jsonb_agg(
                jsonb_build_object(
                    'name', l.name,
                    'total_assigned', COUNT(DISTINCT sa.id),
                    'completed', COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END),
                    'response_rate', ROUND(
                        COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END)::numeric 
                        / NULLIF(COUNT(DISTINCT sa.id), 0) * 100, 
                        1
                    )
                )
            ) as stats
        FROM locations l
        JOIN profiles p ON p.location_id = l.id
        JOIN survey_assignments sa ON sa.user_id = p.id
        LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
            AND sr.campaign_instance_id = p_instance_id
        GROUP BY l.id
    )
    SELECT jsonb_object_agg(metric, stats)
    INTO v_demographic_stats
    FROM demographic_stats;

    -- Get aggregated question statistics (excluding text-based questions)
    WITH question_responses AS (
        SELECT 
            q->>'name' as question_key,
            q->>'title' as question_title,
            q->>'type' as question_type,
            (q->>'rateCount')::int as rate_count,
            jsonb_agg(
                CASE 
                    WHEN q->>'type' IN ('rating', 'nps') THEN 
                        CASE 
                            WHEN (sr.response_data->>question_key)::numeric IS NOT NULL 
                            THEN jsonb_build_object('value', (sr.response_data->>question_key)::numeric)
                            ELSE NULL 
                        END
                    WHEN q->>'type' = 'boolean' THEN 
                        jsonb_build_object('value', (sr.response_data->>question_key)::boolean)
                    ELSE NULL
                END
            ) FILTER (WHERE sr.response_data->>question_key IS NOT NULL) as responses
        FROM survey_campaigns sc
        CROSS JOIN jsonb_array_elements(
            (SELECT json_data->'pages' FROM surveys WHERE id = sc.survey_id)
        ) as page
        CROSS JOIN jsonb_array_elements(page->'elements') as q
        LEFT JOIN survey_responses sr ON sr.campaign_instance_id = p_instance_id
        WHERE sc.id = p_campaign_id
        AND q->>'type' IN ('rating', 'nps', 'boolean')
        GROUP BY q->>'name', q->>'title', q->>'type', q->>'rateCount'
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'key', question_key,
            'title', question_title,
            'type', question_type,
            'stats', 
            CASE 
                WHEN question_type IN ('rating', 'nps') THEN
                    jsonb_build_object(
                        'average', (
                            SELECT AVG((r->>'value')::numeric)
                            FROM jsonb_array_elements(responses) r
                        ),
                        'distribution', (
                            WITH value_counts AS (
                                SELECT (r->>'value')::numeric as value,
                                       COUNT(*) as count
                                FROM jsonb_array_elements(responses) r
                                GROUP BY (r->>'value')::numeric
                            )
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'value', value,
                                    'count', count
                                )
                                ORDER BY value
                            )
                            FROM value_counts
                        )
                    )
                WHEN question_type = 'boolean' THEN
                    jsonb_build_object(
                        'true_count', (
                            SELECT COUNT(*) 
                            FROM jsonb_array_elements(responses) r 
                            WHERE (r->>'value')::boolean = true
                        ),
                        'false_count', (
                            SELECT COUNT(*) 
                            FROM jsonb_array_elements(responses) r 
                            WHERE (r->>'value')::boolean = false
                        )
                    )
                ELSE NULL
            END
        )
    )
    INTO v_question_stats
    FROM question_responses;

    -- Combine all data
    SELECT jsonb_build_object(
        'instance_info', COALESCE(v_instance_info, '{}'::jsonb),
        'completion_trends', COALESCE(v_completion_trends, '[]'::jsonb),
        'demographic_stats', COALESCE(v_demographic_stats, '{}'::jsonb),
        'question_stats', COALESCE(v_question_stats, '[]'::jsonb)
    )
    INTO v_result;

    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "survey_id" "uuid", "campaign_id" "uuid", "user_id" "uuid", "public_access_token" "uuid", "last_reminder_sent" timestamp with time zone, "instance" "jsonb", "survey" "jsonb", "status" "text", "response" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH relevant_instances AS (
    -- Get instances from non-draft campaigns that are either active or completed
    SELECT 
      ci.id,
      ci.campaign_id,
      ci.starts_at,
      ci.ends_at,
      ci.status,
      ci.period_number,
      sc.anonymous  -- Include anonymous flag from campaign
    FROM campaign_instances ci
    JOIN survey_campaigns sc ON ci.campaign_id = sc.id
    WHERE sc.status != 'draft'
    AND ci.status IN ('active', 'completed')
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
         AND sr.campaign_instance_id = ri.id
       LIMIT 1) as response_data,
      -- Get the response status
      (SELECT sr.status 
       FROM survey_responses sr 
       WHERE sr.assignment_id = sa.id 
         AND sr.campaign_instance_id = ri.id
       LIMIT 1) as response_status,
      -- Instance details with unique identifier and anonymous flag
      jsonb_build_object(
        'id', ri.id,
        'starts_at', ri.starts_at,
        'ends_at', ri.ends_at,
        'status', ri.status,
        'period_number', ri.period_number,
        'unique_key', sa.id || '_' || ri.period_number, -- Add unique key
        'anonymous', ri.anonymous -- Include anonymous flag
      ) as instance_details
    FROM survey_assignments sa
    JOIN relevant_instances ri ON sa.campaign_id = ri.campaign_id
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
  FROM assignment_info ai
  ORDER BY (ai.instance_details->>'period_number')::int DESC;
END;
$$;


ALTER FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("primary_sbu" "text", "primary_manager" "text", "respondent_name" "text", "response_data" "jsonb", "submitted_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH campaign_info AS (
        SELECT 
            sc.id,
            sc.anonymous
        FROM survey_campaigns sc
        WHERE sc.id = p_campaign_id
    )
    SELECT 
        COALESCE(sbu.name, 'N/A') as primary_sbu,
        CASE 
            WHEN sup.first_name IS NOT NULL AND sup.last_name IS NOT NULL 
            THEN sup.first_name || ' ' || sup.last_name 
            ELSE 'N/A' 
        END as primary_manager,
        CASE 
            WHEN ci.anonymous THEN 'Anonymous'
            WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
            THEN p.first_name || ' ' || p.last_name 
            ELSE 'N/A' 
        END as respondent_name,
        sr.response_data,
        sr.submitted_at
    FROM survey_responses sr
    JOIN survey_assignments sa ON sr.assignment_id = sa.id
    JOIN campaign_info ci ON sa.campaign_id = ci.id
    JOIN profiles p ON sa.user_id = p.id
    LEFT JOIN user_sbus us ON us.user_id = p.id AND us.is_primary = true
    LEFT JOIN sbus sbu ON us.sbu_id = sbu.id
    LEFT JOIN user_supervisors usup ON usup.user_id = p.id AND usup.is_primary = true
    LEFT JOIN profiles sup ON usup.supervisor_id = sup.id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    ORDER BY sr.submitted_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_campaign_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If all instances are completed, cleanup the cron job
    IF NOT EXISTS (
        SELECT 1 
        FROM campaign_instances 
        WHERE campaign_id = NEW.id 
        AND status NOT IN ('completed')
    ) THEN
        PERFORM cleanup_campaign_cron_job(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_campaign_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_campaign_end"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Mark campaign as completed
    UPDATE survey_campaigns
    SET status = 'completed'
    WHERE id = p_campaign_id
    AND ends_at <= timezone('utc', NOW());
    
    -- Clean up all cron jobs
    PERFORM cleanup_campaign_cron_jobs(p_campaign_id);
END;
$$;


ALTER FUNCTION "public"."handle_campaign_end"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_campaign_scheduling"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Schedule all three jobs for the campaign
    PERFORM schedule_campaign_jobs(NEW.id);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to schedule campaign jobs for campaign %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_campaign_scheduling"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_count_before INTEGER;
    v_count_after INTEGER;
    v_now TIMESTAMPTZ;
    v_instance RECORD;
    v_buffer INTERVAL := '2 minutes';
BEGIN
    v_now := timezone('utc', NOW());
    
    -- Log start of execution with campaign details
    RAISE NOTICE 'Starting instance activation check for campaign % at %', p_campaign_id, v_now;
    
    -- Count eligible instances before update (with buffer)
    SELECT COUNT(*)
    INTO v_count_before
    FROM campaign_instances ci
    WHERE ci.campaign_id = p_campaign_id
    AND ci.status = 'upcoming'
    AND ci.starts_at <= (v_now + v_buffer)
    AND ci.ends_at > v_now;
    
    RAISE NOTICE 'Found % instances eligible for activation (including 2-minute buffer)', v_count_before;
    
    -- Log current instances status and evaluation conditions
    FOR v_instance IN (
        SELECT 
            ci.id,
            ci.status,
            ci.starts_at,
            ci.ends_at,
            ci.starts_at <= (v_now + v_buffer) as meets_start_condition,
            ci.ends_at > v_now as meets_end_condition,
            ci.status = 'upcoming' as meets_status_condition
        FROM campaign_instances ci
        WHERE ci.campaign_id = p_campaign_id
    ) LOOP
        RAISE NOTICE 'Instance ID: %, Status: %, Starts: %, Ends: %, Meets conditions: (start: %, end: %, status: %)',
            v_instance.id, 
            v_instance.status, 
            v_instance.starts_at, 
            v_instance.ends_at,
            v_instance.meets_start_condition,
            v_instance.meets_end_condition,
            v_instance.meets_status_condition;
    END LOOP;

    -- Create temporary table for tracking updates
    CREATE TEMP TABLE temp_updated_instances (
        id uuid,
        starts_at timestamptz,
        ends_at timestamptz
    );
    
    -- Update eligible instances and capture in temp table
    WITH updated AS (
        UPDATE campaign_instances ci
        SET 
            status = 'active',
            updated_at = v_now
        WHERE ci.campaign_id = p_campaign_id
        AND ci.status = 'upcoming'
        AND ci.starts_at <= (v_now + v_buffer)
        AND ci.ends_at > v_now
        RETURNING ci.id, ci.starts_at, ci.ends_at
    )
    INSERT INTO temp_updated_instances
    SELECT id, starts_at, ends_at FROM updated;
    
    -- Get count of actually updated records
    SELECT COUNT(*) INTO v_count_after FROM temp_updated_instances;
    
    RAISE NOTICE 'Actually updated % instances to active', v_count_after;
    
    -- Log details of updated instances
    FOR v_instance IN (
        SELECT * FROM temp_updated_instances
    ) LOOP
        RAISE NOTICE 'Activated instance: ID %, Start time: %, End time: %',
            v_instance.id, v_instance.starts_at, v_instance.ends_at;
    END LOOP;

    -- Insert into logs table with detailed information
    INSERT INTO campaign_instance_status_logs (
        updated_to_active,
        updated_to_completed,
        run_at,
        details
    )
    SELECT 
        v_count_after,
        0,
        v_now,
        json_build_object(
            'campaign_id', p_campaign_id,
            'current_time', v_now,
            'eligible_instances_before', v_count_before,
            'instances_actually_updated', v_count_after,
            'buffer_minutes', 2,
            'execution_details', CASE 
                WHEN v_count_before > 0 THEN 
                    format('Found %s eligible instances, activated %s', v_count_before, v_count_after)
                ELSE 
                    'No eligible instances found'
                END
        );

    -- Clean up temporary table
    DROP TABLE IF EXISTS temp_updated_instances;

    RAISE NOTICE 'Completed instance activation check for campaign % at %', p_campaign_id, v_now;
END;
$$;


ALTER FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_instance_due_time"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_count_before INTEGER;
    v_count_after INTEGER;
    v_now TIMESTAMPTZ;
    v_instance RECORD;
    v_buffer INTERVAL := '2 minutes';
BEGIN
    v_now := timezone('utc', NOW());
    
    -- Log start of execution with campaign details
    RAISE NOTICE 'Starting instance completion check for campaign % at %', p_campaign_id, v_now;
    
    -- Count eligible instances before update (with buffer)
    SELECT COUNT(*)
    INTO v_count_before
    FROM campaign_instances ci
    WHERE ci.campaign_id = p_campaign_id
    AND ci.status = 'active'
    AND ci.ends_at <= (v_now + v_buffer);
    
    RAISE NOTICE 'Found % instances eligible for completion (including 2-minute buffer)', v_count_before;
    
    -- Log current instances status and evaluation conditions
    FOR v_instance IN (
        SELECT 
            ci.id,
            ci.status,
            ci.starts_at,
            ci.ends_at,
            ci.ends_at <= (v_now + v_buffer) as meets_end_condition,
            ci.status = 'active' as meets_status_condition
        FROM campaign_instances ci
        WHERE ci.campaign_id = p_campaign_id
    ) LOOP
        RAISE NOTICE 'Instance ID: %, Status: %, Starts: %, Ends: %, Meets conditions: (end: %, status: %)',
            v_instance.id, 
            v_instance.status, 
            v_instance.starts_at, 
            v_instance.ends_at,
            v_instance.meets_end_condition,
            v_instance.meets_status_condition;
    END LOOP;

    -- Create temporary table for tracking updates
    CREATE TEMP TABLE temp_completed_instances (
        id uuid,
        starts_at timestamptz,
        ends_at timestamptz
    );
    
    -- Update eligible instances and capture in temp table
    WITH updated AS (
        UPDATE campaign_instances ci
        SET 
            status = 'completed',
            updated_at = v_now
        WHERE ci.campaign_id = p_campaign_id
        AND ci.status = 'active'
        AND ci.ends_at <= (v_now + v_buffer)
        RETURNING ci.id, ci.starts_at, ci.ends_at
    )
    INSERT INTO temp_completed_instances
    SELECT id, starts_at, ends_at FROM updated;
    
    -- Get count of actually updated records
    SELECT COUNT(*) INTO v_count_after FROM temp_completed_instances;
    
    RAISE NOTICE 'Actually completed % instances', v_count_after;
    
    -- Log details of completed instances
    FOR v_instance IN (
        SELECT * FROM temp_completed_instances
    ) LOOP
        RAISE NOTICE 'Completed instance: ID %, Start time: %, End time: %',
            v_instance.id, v_instance.starts_at, v_instance.ends_at;
    END LOOP;

    -- Insert into logs table with detailed information
    INSERT INTO campaign_instance_status_logs (
        updated_to_active,
        updated_to_completed,
        run_at,
        details
    )
    SELECT 
        0,
        v_count_after,
        v_now,
        json_build_object(
            'campaign_id', p_campaign_id,
            'current_time', v_now,
            'eligible_instances_before', v_count_before,
            'instances_actually_completed', v_count_after,
            'buffer_minutes', 2,
            'execution_details', CASE 
                WHEN v_count_before > 0 THEN 
                    format('Found %s eligible instances, completed %s', v_count_before, v_count_after)
                ELSE 
                    'No eligible instances found'
                END
        );

    -- Clean up temporary table
    DROP TABLE IF EXISTS temp_completed_instances;

    RAISE NOTICE 'Completed instance completion check for campaign % at %', p_campaign_id, v_now;
END;
$$;


ALTER FUNCTION "public"."handle_instance_due_time"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_live_session_questions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_survey_data jsonb;
    v_question jsonb;
    v_display_order integer := 1;
BEGIN
    -- Get the survey data for the live session
    SELECT json_data::jsonb INTO v_survey_data
    FROM surveys
    WHERE id = NEW.survey_id;

    -- If no survey found or no questions, exit
    IF v_survey_data IS NULL OR v_survey_data->'pages' IS NULL THEN
        RETURN NEW;
    END IF;

    -- Iterate through pages and questions
    FOR v_question IN
        SELECT question
        FROM jsonb_array_elements(v_survey_data->'pages') AS page,
             jsonb_array_elements(page->'elements') AS question
    LOOP
        -- Insert each question as a live session question
        INSERT INTO live_session_questions (
            session_id,
            question_key,
            question_data,
            status,
            display_order
        ) VALUES (
            NEW.id,
            v_question->>'name',
            jsonb_build_object(
                'title', COALESCE(v_question->>'title', 'Untitled Question'),
                'type', COALESCE(v_question->>'type', 'unknown'),
                'choices', v_question->'choices',
                'isRequired', v_question->'isRequired'
            ),
            'pending',
            v_display_order
        );
        
        v_display_order := v_display_order + 1;
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_live_session_questions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Insert into profiles with org_id
  INSERT INTO public.profiles (id, email, org_id)
  VALUES (new.id, new.email, NULL);
  
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_question_activation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If the new status is 'active'
    IF NEW.status = 'active' THEN
        -- Mark all other active questions in the same session as completed
        UPDATE live_session_questions
        SET 
            status = 'completed',
            disabled_at = NOW()
        WHERE 
            session_id = NEW.session_id 
            AND id != NEW.id 
            AND status = 'active';
            
        -- Set enabled_at timestamp for the newly activated question
        NEW.enabled_at = NOW();
    END IF;
    
    -- If the status is being changed to completed, set the disabled_at timestamp
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.disabled_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_question_activation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE issues 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.issue_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE issues 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.issue_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."handle_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_vote_count"("issue_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE issues
  SET vote_count = vote_count + 1
  WHERE id = issue_id;
END;
$$;


ALTER FUNCTION "public"."increment_vote_count"("issue_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_uid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."is_admin"("user_uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_response_to_active_instance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."link_response_to_active_instance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_duplicate_responses"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM live_session_responses
    WHERE session_id = NEW.session_id
    AND participant_id = NEW.participant_id
    AND question_key = NEW.question_key
  ) THEN
    RAISE EXCEPTION 'Duplicate response: A response from this participant for this question already exists';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_duplicate_responses"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_modifying_submitted_responses"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM survey_responses 
    WHERE assignment_id = NEW.assignment_id 
    AND user_id = NEW.user_id 
    AND campaign_instance_id = NEW.campaign_instance_id 
    AND status = 'submitted'
  ) THEN
    RAISE EXCEPTION 'Cannot modify a submitted survey response';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_modifying_submitted_responses"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF p_direction = 'down' THEN
    -- Moving a question down
    -- First, shift all questions in between one position up
    UPDATE live_session_questions
    SET display_order = display_order - 1
    WHERE session_id = p_session_id
      AND display_order > p_old_order
      AND display_order <= p_new_order
      AND id != p_question_id;
      
    -- Then set the new position for the moved question
    UPDATE live_session_questions
    SET display_order = p_new_order
    WHERE id = p_question_id;
  ELSE
    -- Moving a question up
    -- First, shift all questions in between one position down
    UPDATE live_session_questions
    SET display_order = display_order + 1
    WHERE session_id = p_session_id
      AND display_order >= p_new_order
      AND display_order < p_old_order
      AND id != p_question_id;
      
    -- Then set the new position for the moved question
    UPDATE live_session_questions
    SET display_order = p_new_order
    WHERE id = p_question_id;
  END IF;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."schedule_campaign_cron_job"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_campaign RECORD;
    v_cron_schedule TEXT;
    v_job_name TEXT;
    v_error_message TEXT;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign 
    FROM survey_campaigns 
    WHERE id = p_campaign_id;
    
    -- Generate job name with schema qualification
    v_job_name := 'update_campaign_' || p_campaign_id::text;
    
    -- Generate cron schedule
    v_cron_schedule := generate_campaign_cron_schedule(
        v_campaign.starts_at,
        v_campaign.recurring_frequency,
        v_campaign.recurring_days
    );
    
    BEGIN
        -- Schedule the cron job with fully qualified function name
        PERFORM cron.schedule(
            v_job_name, 
            v_cron_schedule, 
            format(
                'SELECT public.update_campaign_instances(%L)',
                p_campaign_id
            )
        );
        
        -- Record successful job creation
        INSERT INTO campaign_cron_jobs (
            campaign_id,
            job_name,
            cron_schedule,
            is_active
        ) VALUES (
            p_campaign_id,
            v_job_name,
            v_cron_schedule,
            true
        );

        -- Log successful attempt
        INSERT INTO campaign_cron_job_logs (
            campaign_id,
            job_name,
            cron_schedule,
            status,
            error_message
        ) VALUES (
            p_campaign_id,
            v_job_name,
            v_cron_schedule,
            'SUCCESS',
            NULL
        );

    EXCEPTION WHEN OTHERS THEN
        -- Capture error message
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        
        -- Log failed attempt
        INSERT INTO campaign_cron_job_logs (
            campaign_id,
            job_name,
            cron_schedule,
            status,
            error_message
        ) VALUES (
            p_campaign_id,
            v_job_name,
            v_cron_schedule,
            'ERROR',
            v_error_message
        );
        
        -- Re-raise the error
        RAISE NOTICE 'Failed to schedule cron job for campaign %: %', p_campaign_id, v_error_message;
    END;
END;
$$;


ALTER FUNCTION "public"."schedule_campaign_cron_job"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."schedule_campaign_jobs"("p_campaign_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_campaign RECORD;
    v_schedule TEXT;
    v_job_name TEXT;
    v_error_message TEXT;
BEGIN
    -- Get campaign details
    SELECT * INTO v_campaign 
    FROM survey_campaigns 
    WHERE id = p_campaign_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found: %', p_campaign_id;
    END IF;

    -- Schedule instance activation job using campaign start time
    v_job_name := 'campaign_' || p_campaign_id::text || '_instance_activation';
    v_schedule := generate_campaign_cron_schedule(
        v_campaign.starts_at,
        v_campaign.recurring_frequency,
        'instance_activation'::cron_job_type
    );
    
    PERFORM cron.schedule(
        v_job_name,
        v_schedule,
        format('SELECT handle_instance_activation(%L)', p_campaign_id)
    );
    
    INSERT INTO campaign_cron_jobs (
        campaign_id,
        job_name,
        job_type,
        cron_schedule,
        is_active
    ) VALUES (
        p_campaign_id,
        v_job_name,
        'instance_activation',
        v_schedule,
        true
    );
    
    -- Schedule instance due time job using instance_end_time
    IF v_campaign.instance_end_time IS NOT NULL THEN
        v_job_name := 'campaign_' || p_campaign_id::text || '_instance_due_check';
        v_schedule := generate_campaign_cron_schedule(
            v_campaign.instance_end_time,
            v_campaign.recurring_frequency, -- Pass the recurring_frequency here instead of null
            'instance_due_time'::cron_job_type
        );
        
        PERFORM cron.schedule(
            v_job_name,
            v_schedule,
            format('SELECT handle_instance_due_time(%L)', p_campaign_id)
        );
        
        INSERT INTO campaign_cron_jobs (
            campaign_id,
            job_name,
            job_type,
            cron_schedule,
            is_active
        ) VALUES (
            p_campaign_id,
            v_job_name,
            'instance_due_time',
            v_schedule,
            true
        );
    END IF;
    
    -- Schedule campaign end job
    IF v_campaign.ends_at IS NOT NULL THEN
        v_job_name := 'campaign_' || p_campaign_id::text || '_end_check';
        v_schedule := generate_campaign_cron_schedule(
            v_campaign.ends_at,
            null,
            'campaign_end'::cron_job_type
        );
        
        PERFORM cron.schedule(
            v_job_name,
            v_schedule,
            format('SELECT handle_campaign_end(%L)', p_campaign_id)
        );
        
        INSERT INTO campaign_cron_jobs (
            campaign_id,
            job_name,
            job_type,
            cron_schedule,
            is_active
        ) VALUES (
            p_campaign_id,
            v_job_name,
            'campaign_end',
            v_schedule,
            true
        );
    END IF;

EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    
    INSERT INTO campaign_cron_job_logs (
        campaign_id,
        job_name,
        status,
        error_message
    ) VALUES (
        p_campaign_id,
        v_job_name,
        'ERROR',
        v_error_message
    );
    
    RAISE EXCEPTION 'Failed to schedule campaign jobs: %', v_error_message;
END;
$$;


ALTER FUNCTION "public"."schedule_campaign_jobs"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "join_code" "text", "status" "public"."session_status", "created_at" timestamp with time zone, "description" "text", "survey_id" "uuid", "created_by" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ls.id,
    ls.name,
    ls.join_code,
    ls.status,
    ls.created_at,
    ls.description,
    ls.survey_id,
    ls.created_by
  FROM live_survey_sessions ls
  WHERE 
    (
      search_text IS NULL 
      OR search_text = '' 
      OR ls.name ILIKE '%' || search_text || '%'
    )
    AND (
      status_filters IS NULL 
      OR status_filters = '{}'::text[] 
      OR ls.status::text = ANY(status_filters)
    )
    AND (
      created_by_user IS NULL  -- If no user filter specified, show all sessions
      OR created_by_user = uuid_nil() -- Also show all if uuid_nil passed
      OR (created_by_user IS NOT NULL AND ls.created_by = created_by_user) -- Only filter if specific user requested
    )
  ORDER BY ls.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("profile" "json", "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  status_filter text;
  role_filter text;
  base_search text;
  query text;
  count_query text;
BEGIN
  -- Extract filters using regex
  status_filter := (SELECT SUBSTRING(search_text FROM 'status:([^\s]+)'));
  role_filter := (SELECT SUBSTRING(search_text FROM 'role:([^\s]+)'));
  -- Remove filters from base search
  base_search := regexp_replace(regexp_replace(search_text, 'status:\S+\s*', ''), 'role:\S+\s*', '');

  -- Build the base query
  query := 'WITH filtered_profiles AS (
    SELECT p.*, ur.role,
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
    WHERE 1=1';

  -- Add SBU filter if provided
  IF sbu_filter IS NOT NULL THEN
    query := query || ' AND EXISTS (
      SELECT 1 FROM user_sbus us 
      WHERE us.user_id = p.id AND us.sbu_id = ''' || sbu_filter || '''
    )';
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

  query := query || ' GROUP BY p.id, ur.role';

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
        ''user_roles'', json_build_object(''role'', p.role),
        ''user_sbus'', p.user_sbus
      ) as profile,
      COUNT(*) OVER() as total_count
    FROM filtered_profiles p
    ORDER BY p.created_at DESC
    LIMIT ' || page_size || '
    OFFSET ' || (page_number - 1) * page_size;

  RETURN QUERY EXECUTE query;
END;
$$;


ALTER FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid" DEFAULT NULL::"uuid", "level_filter" "uuid" DEFAULT NULL::"uuid", "location_filter" "uuid" DEFAULT NULL::"uuid", "employment_type_filter" "uuid" DEFAULT NULL::"uuid", "employee_role_filter" "uuid" DEFAULT NULL::"uuid", "employee_type_filter" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("profile" "json", "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    status_filter text;
    role_filter text;
    base_search text;
    query text;
    count_query text;
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


ALTER FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_check_achievements"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only trigger on submission
    IF NEW.status = 'submitted' THEN
        PERFORM check_and_award_achievements(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_check_achievements"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_campaign_completion_rate"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the completion rate for the campaign
  WITH campaign_stats AS (
    SELECT 
      campaign_id,
      COUNT(*) as total_assignments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments
    FROM survey_assignments
    WHERE campaign_id = (
      SELECT campaign_id 
      FROM survey_assignments 
      WHERE id = NEW.assignment_id
    )
    GROUP BY campaign_id
  )
  UPDATE survey_campaigns
  SET completion_rate = (
    CASE 
      WHEN cs.total_assignments > 0 
      THEN (cs.completed_assignments::numeric / cs.total_assignments::numeric) * 100
      ELSE 0
    END
  )
  FROM campaign_stats cs
  WHERE survey_campaigns.id = cs.campaign_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_campaign_completion_rate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_instance_completion_rate"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update completion rate for the instance
    UPDATE campaign_instances
    SET 
        completion_rate = calculate_instance_completion_rate(NEW.campaign_instance_id),
        updated_at = NOW()
    WHERE id = NEW.campaign_instance_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_instance_completion_rate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_issue_downvote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.issues
    SET downvote_count = (
      SELECT COUNT(*)
      FROM public.issue_downvotes
      WHERE issue_id = OLD.issue_id
    )
    WHERE id = OLD.issue_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    UPDATE public.issues
    SET downvote_count = (
      SELECT COUNT(*)
      FROM public.issue_downvotes
      WHERE issue_id = NEW.issue_id
    )
    WHERE id = NEW.issue_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_issue_downvote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_issue_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE issues 
    SET vote_count = vote_count + 1
    WHERE id = NEW.issue_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE issues 
    SET vote_count = vote_count - 1
    WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_issue_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_campaign_dates"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."validate_campaign_dates"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievement_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "current_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."achievement_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "condition_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "achievement_type" "public"."achievement_type" NOT NULL,
    "status" "public"."achievement_status" DEFAULT 'active'::"public"."achievement_status",
    "icon_color" "text" DEFAULT '#8B5CF6'::"text" NOT NULL
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analysis_prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "prompt_text" "text" NOT NULL,
    "category" "public"."prompt_category" NOT NULL,
    "status" "public"."prompt_status" DEFAULT 'active'::"public"."prompt_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."analysis_prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_cron_job_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "job_name" "text",
    "cron_schedule" "text",
    "status" "text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaign_cron_job_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_cron_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "job_name" "text" NOT NULL,
    "cron_schedule" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "job_type" "public"."cron_job_type" DEFAULT 'instance_activation'::"public"."cron_job_type" NOT NULL
);


ALTER TABLE "public"."campaign_cron_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_instance_status_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_to_active" integer NOT NULL,
    "updated_to_completed" integer NOT NULL,
    "run_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "details" "jsonb"
);


ALTER TABLE "public"."campaign_instance_status_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_instances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "period_number" integer NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "status" "public"."instance_status" DEFAULT 'upcoming'::"public"."instance_status" NOT NULL,
    "completion_rate" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."campaign_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "public"."contact_message_status" DEFAULT 'pending'::"public"."contact_message_status" NOT NULL,
    "sent_to" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "error_message" "text",
    CONSTRAINT "valid_email" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"))
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."config_status" DEFAULT 'active'::"public"."config_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "color_code" "text" DEFAULT '#CBD5E1'::"text"
);


ALTER TABLE "public"."employee_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_roles" IS 'Stores different roles that employees can have';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "level_id" "uuid",
    "profile_image_url" "text",
    "org_id" "text",
    "gender" "public"."gender_type",
    "location_id" "uuid",
    "employment_type_id" "uuid",
    "designation" "text",
    "date_of_birth" "date",
    "status" "public"."profile_status" DEFAULT 'active'::"public"."profile_status" NOT NULL,
    "employee_type_id" "uuid",
    "employee_role_id" "uuid"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."employee_type_id" IS 'Reference to the employee type';



COMMENT ON COLUMN "public"."profiles"."employee_role_id" IS 'Reference to the employee role';



CREATE TABLE IF NOT EXISTS "public"."survey_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assignment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "response_data" "jsonb" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "campaign_instance_id" "uuid",
    "state_data" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "public"."response_status" DEFAULT 'assigned'::"public"."response_status" NOT NULL,
    CONSTRAINT "valid_response_status" CHECK (("status" = ANY (ARRAY['assigned'::"public"."response_status", 'in_progress'::"public"."response_status", 'submitted'::"public"."response_status", 'expired'::"public"."response_status"])))
);


ALTER TABLE "public"."survey_responses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."survey_responses"."state_data" IS 'Stores UI state information like last visited page, navigation history, etc. Separate from response_data to avoid affecting reporting.';



CREATE MATERIALIZED VIEW "public"."demographic_employee_role_analysis" AS
 SELECT COALESCE("er"."name", 'Not Specified'::"text") AS "employee_role",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employee_roles" "er" ON (("er"."id" = "p"."employee_role_id")))
  GROUP BY "er"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC
  WITH NO DATA;


ALTER TABLE "public"."demographic_employee_role_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."config_status" DEFAULT 'active'::"public"."config_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "color_code" "text" DEFAULT '#CBD5E1'::"text"
);


ALTER TABLE "public"."employee_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_types" IS 'Stores different types of employees in the organization';



CREATE MATERIALIZED VIEW "public"."demographic_employee_type_analysis" AS
 SELECT COALESCE("et"."name", 'Not Specified'::"text") AS "employee_type",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employee_types" "et" ON (("et"."id" = "p"."employee_type_id")))
  GROUP BY "et"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC
  WITH NO DATA;


ALTER TABLE "public"."demographic_employee_type_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employment_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."config_status" DEFAULT 'active'::"public"."config_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "color_code" "text" DEFAULT '#CBD5E1'::"text"
);


ALTER TABLE "public"."employment_types" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."demographic_employment_analysis" AS
 SELECT COALESCE("et"."name", 'Not Specified'::"text") AS "employment_type",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employment_types" "et" ON (("et"."id" = "p"."employment_type_id")))
  GROUP BY "et"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


ALTER TABLE "public"."demographic_employment_analysis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."demographic_gender_analysis" AS
 SELECT COALESCE(("p"."gender")::"text", 'Not Specified'::"text") AS "gender",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM ("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
  GROUP BY "p"."gender"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


ALTER TABLE "public"."demographic_gender_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."levels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."config_status" DEFAULT 'active'::"public"."config_status",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "color_code" "text" DEFAULT '#CBD5E1'::"text"
);


ALTER TABLE "public"."levels" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."demographic_level_analysis" AS
 SELECT COALESCE("l"."name", 'Not Specified'::"text") AS "level",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."levels" "l" ON (("l"."id" = "p"."level_id")))
  GROUP BY "l"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC
  WITH NO DATA;


ALTER TABLE "public"."demographic_level_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "google_maps_url" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."demographic_location_analysis" AS
 SELECT COALESCE("l"."name", 'Not Specified'::"text") AS "location",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."locations" "l" ON (("l"."id" = "p"."location_id")))
  GROUP BY "l"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


ALTER TABLE "public"."demographic_location_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "profile_image_url" "text",
    "website" "text",
    "head_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."sbus" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."survey_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "user_id" "uuid" NOT NULL,
    "campaign_id" "uuid",
    "last_reminder_sent" timestamp with time zone,
    "public_access_token" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."survey_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sbus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "sbu_id" "uuid",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_sbus" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."department_performance" AS
 SELECT "sbu"."name" AS "sbu_name",
    "count"(DISTINCT "sa"."id") AS "total_assignments",
    "count"(DISTINCT "sr"."id") AS "completed_responses",
    "round"(((("count"(DISTINCT "sr"."id"))::numeric / (NULLIF("count"(DISTINCT "sa"."id"), 0))::numeric) * (100)::numeric), 2) AS "completion_rate"
   FROM ((("public"."sbus" "sbu"
     JOIN "public"."user_sbus" "us" ON (("us"."sbu_id" = "sbu"."id")))
     JOIN "public"."survey_assignments" "sa" ON (("sa"."user_id" = "us"."user_id")))
     LEFT JOIN "public"."survey_responses" "sr" ON (("sr"."assignment_id" = "sa"."id")))
  GROUP BY "sbu"."name"
  ORDER BY ("round"(((("count"(DISTINCT "sr"."id"))::numeric / (NULLIF("count"(DISTINCT "sa"."id"), 0))::numeric) * (100)::numeric), 2)) DESC;


ALTER TABLE "public"."department_performance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider" "public"."email_provider" DEFAULT 'resend'::"public"."email_provider" NOT NULL,
    "from_email" "text" NOT NULL,
    "from_name" "text" NOT NULL,
    "provider_settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_singleton" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."email_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "original_email" "jsonb" NOT NULL,
    "response_email" "jsonb",
    "submitted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "attempt_number" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."email_responses" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."instance_comparison_metrics" AS
 WITH "response_metrics" AS (
         SELECT "sr"."campaign_instance_id",
            "ci"."period_number",
            "ci"."starts_at",
            "ci"."ends_at",
            "count"(DISTINCT "sr"."id") AS "total_responses",
            "count"(DISTINCT "sr"."user_id") AS "unique_respondents",
            "ci"."completion_rate",
            "avg"(
                CASE
                    WHEN ("value_data"."value" ~ '^\d+(\.\d+)?$'::"text") THEN ("value_data"."value")::numeric
                    ELSE NULL::numeric
                END) AS "avg_rating"
           FROM (("public"."survey_responses" "sr"
             CROSS JOIN LATERAL "jsonb_each_text"("sr"."response_data") "value_data"("key", "value"))
             JOIN "public"."campaign_instances" "ci" ON (("sr"."campaign_instance_id" = "ci"."id")))
          WHERE ("sr"."status" = 'submitted'::"public"."response_status")
          GROUP BY "sr"."campaign_instance_id", "ci"."period_number", "ci"."starts_at", "ci"."ends_at", "ci"."completion_rate"
        ), "demographic_changes" AS (
         SELECT "sr"."campaign_instance_id",
            "p"."location_id",
            "l"."name" AS "location_name",
            "count"(DISTINCT "sr"."id") AS "location_responses",
            "p"."gender",
            "count"(DISTINCT
                CASE
                    WHEN ("p"."gender" IS NOT NULL) THEN "sr"."id"
                    ELSE NULL::"uuid"
                END) AS "gender_responses"
           FROM (("public"."survey_responses" "sr"
             JOIN "public"."profiles" "p" ON (("sr"."user_id" = "p"."id")))
             LEFT JOIN "public"."locations" "l" ON (("p"."location_id" = "l"."id")))
          WHERE ("sr"."status" = 'submitted'::"public"."response_status")
          GROUP BY "sr"."campaign_instance_id", "p"."location_id", "l"."name", "p"."gender"
        )
 SELECT "rm"."campaign_instance_id",
    "rm"."period_number",
    "rm"."starts_at",
    "rm"."ends_at",
    "rm"."total_responses",
    "rm"."unique_respondents",
    "rm"."completion_rate",
    "rm"."avg_rating",
    "jsonb_agg"("jsonb_build_object"('location_id', "dc"."location_id", 'location_name', "dc"."location_name", 'response_count', "dc"."location_responses")) AS "location_breakdown",
    "jsonb_agg"("jsonb_build_object"('gender', "dc"."gender", 'response_count', "dc"."gender_responses")) AS "gender_breakdown"
   FROM ("response_metrics" "rm"
     LEFT JOIN "demographic_changes" "dc" ON (("rm"."campaign_instance_id" = "dc"."campaign_instance_id")))
  GROUP BY "rm"."campaign_instance_id", "rm"."period_number", "rm"."starts_at", "rm"."ends_at", "rm"."total_responses", "rm"."unique_respondents", "rm"."completion_rate", "rm"."avg_rating";


ALTER TABLE "public"."instance_comparison_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."instance_question_comparison" AS
 SELECT "sr"."campaign_instance_id",
    "ci"."period_number",
    "value_data"."key" AS "question_key",
    "count"(*) AS "response_count",
    "avg"(
        CASE
            WHEN ("value_data"."value" ~ '^\d+(\.\d+)?$'::"text") THEN ("value_data"."value")::numeric
            ELSE NULL::numeric
        END) AS "avg_numeric_value",
    ((("sum"(
        CASE
            WHEN ("value_data"."value" = 'true'::"text") THEN 1
            ELSE 0
        END))::double precision / ("count"(*))::double precision) * (100)::double precision) AS "yes_percentage",
    "array_agg"(
        CASE
            WHEN ((NOT ("value_data"."value" ~ '^\d+(\.\d+)?$'::"text")) AND ("value_data"."value" <> 'true'::"text") AND ("value_data"."value" <> 'false'::"text")) THEN "value_data"."value"
            ELSE NULL::"text"
        END) FILTER (WHERE ("value_data"."value" IS NOT NULL)) AS "text_responses"
   FROM (("public"."survey_responses" "sr"
     CROSS JOIN LATERAL "jsonb_each_text"("sr"."response_data") "value_data"("key", "value"))
     JOIN "public"."campaign_instances" "ci" ON (("sr"."campaign_instance_id" = "ci"."id")))
  WHERE ("sr"."status" = 'submitted'::"public"."response_status")
  GROUP BY "sr"."campaign_instance_id", "ci"."period_number", "value_data"."key";


ALTER TABLE "public"."instance_question_comparison" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issue_board_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "board_id" "uuid" NOT NULL,
    "can_view" boolean DEFAULT false NOT NULL,
    "can_create" boolean DEFAULT false NOT NULL,
    "can_vote" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "sbu_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "level_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "location_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "employment_type_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "employee_type_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "employee_role_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[]
);


ALTER TABLE "public"."issue_board_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issue_boards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "public"."issue_board_status" DEFAULT 'active'::"public"."issue_board_status" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."issue_boards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issue_downvotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "issue_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."issue_downvotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issue_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "issue_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."issue_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "board_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "status" "public"."issue_status" DEFAULT 'open'::"public"."issue_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "vote_count" integer DEFAULT 0 NOT NULL,
    "downvote_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_session_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_active_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "display_name" "text" NOT NULL,
    "status" "text" DEFAULT 'connected'::"text",
    CONSTRAINT "display_name_length" CHECK ((("char_length"("display_name") >= 2) AND ("char_length"("display_name") <= 50))),
    CONSTRAINT "live_session_participants_status_check" CHECK (("status" = ANY (ARRAY['connected'::"text", 'disconnected'::"text"]))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['connected'::"text", 'disconnected'::"text"])))
);

ALTER TABLE ONLY "public"."live_session_participants" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."live_session_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_session_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "question_key" "text" NOT NULL,
    "question_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "enabled_at" timestamp with time zone,
    "disabled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text",
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'completed'::"text"])))
);

ALTER TABLE ONLY "public"."live_session_questions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."live_session_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_session_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "response_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "question_key" "text",
    "response_time" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."live_session_responses" REPLICA IDENTITY FULL;


ALTER TABLE "public"."live_session_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_survey_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "join_code" "text" NOT NULL,
    "status" "public"."session_status" DEFAULT 'initial'::"public"."session_status" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."live_survey_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "json_data" "jsonb" NOT NULL,
    "status" "public"."survey_status" DEFAULT 'draft'::"public"."survey_status",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "theme_settings" "jsonb" DEFAULT "jsonb_build_object"('baseTheme', 'Layered', 'isDark', true, 'isPanelless', true)
);


ALTER TABLE "public"."surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_supervisors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "supervisor_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "cannot_supervise_self" CHECK (("user_id" <> "supervisor_id"))
);


ALTER TABLE "public"."user_supervisors" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."managers_needing_improvement" AS
 WITH "rating_responses" AS (
         SELECT "sr"."user_id" AS "respondent_id",
            "us"."supervisor_id" AS "manager_id",
            ("s"."json_data" -> 'pages'::"text") AS "survey_pages",
            "sr"."response_data",
            "sr"."submitted_at"
           FROM ((("public"."survey_responses" "sr"
             JOIN "public"."survey_assignments" "sa" ON (("sr"."assignment_id" = "sa"."id")))
             JOIN "public"."surveys" "s" ON (("sa"."survey_id" = "s"."id")))
             JOIN "public"."user_supervisors" "us" ON (("sr"."user_id" = "us"."user_id")))
          WHERE (("sr"."submitted_at" IS NOT NULL) AND ("us"."is_primary" = true))
        ), "flattened_ratings" AS (
         SELECT "rr"."manager_id",
            "rr"."respondent_id",
            ("q"."value" ->> 'name'::"text") AS "question_name",
            ("q"."value" ->> 'type'::"text") AS "question_type",
                CASE
                    WHEN ((("q"."value" ->> 'rateCount'::"text"))::integer IS NOT NULL) THEN (("q"."value" ->> 'rateCount'::"text"))::integer
                    ELSE 5
                END AS "rate_scale",
            (("rr"."response_data" -> ("q"."value" ->> 'name'::"text")))::numeric AS "rating_value"
           FROM "rating_responses" "rr",
            LATERAL "jsonb_array_elements"("rr"."survey_pages") "pages"("value"),
            LATERAL "jsonb_array_elements"(("pages"."value" -> 'elements'::"text")) "q"("value")
          WHERE ((("q"."value" ->> 'type'::"text") = 'rating'::"text") AND ((("rr"."response_data" -> ("q"."value" ->> 'name'::"text")))::numeric IS NOT NULL))
        ), "manager_scores" AS (
         SELECT "fr"."manager_id",
            (("p"."first_name" || ' '::"text") || "p"."last_name") AS "manager_name",
            "count"(DISTINCT "fr"."respondent_id") AS "total_respondents",
            "count"("fr"."rating_value") AS "total_ratings",
            "round"("avg"((("fr"."rating_value" / ("fr"."rate_scale")::numeric) * (100)::numeric)), 2) AS "average_score"
           FROM ("flattened_ratings" "fr"
             JOIN "public"."profiles" "p" ON (("fr"."manager_id" = "p"."id")))
          GROUP BY "fr"."manager_id", "p"."first_name", "p"."last_name"
         HAVING ("count"(DISTINCT "fr"."respondent_id") >= 3)
        )
 SELECT "manager_scores"."manager_id",
    "manager_scores"."manager_name",
    "manager_scores"."total_respondents",
    "manager_scores"."total_ratings",
    "manager_scores"."average_score",
    "rank"() OVER (ORDER BY "manager_scores"."average_score") AS "improvement_rank"
   FROM "manager_scores"
  WHERE ("manager_scores"."average_score" > (0)::numeric)
 LIMIT 10;


ALTER TABLE "public"."managers_needing_improvement" OWNER TO "postgres";


COMMENT ON VIEW "public"."managers_needing_improvement" IS 'Shows bottom 10 managers based on weighted average of rating questions from surveys. 
Requires minimum 3 respondents per manager. Scores are normalized to percentage scale.
These managers may need additional support or training to improve their performance.';



CREATE TABLE IF NOT EXISTS "public"."survey_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "survey_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "campaign_type" "text" DEFAULT 'one_time'::"text" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurring_frequency" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "completion_rate" numeric DEFAULT 0,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone,
    "instance_duration_days" integer,
    "anonymous" boolean DEFAULT false NOT NULL,
    "instance_end_time" timestamp with time zone
);


ALTER TABLE "public"."survey_campaigns" OWNER TO "postgres";


COMMENT ON COLUMN "public"."survey_campaigns"."anonymous" IS 'When true, responses to this campaign will be anonymous';



CREATE OR REPLACE VIEW "public"."recent_activities" AS
 SELECT "sr"."id",
    'response'::"text" AS "activity_type",
    "sr"."created_at" AS "activity_time",
    (("p"."first_name" || ' '::"text") || "p"."last_name") AS "user_name",
    "s"."name" AS "survey_name",
    "sc"."name" AS "campaign_name"
   FROM (((("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("sr"."user_id" = "p"."id")))
     JOIN "public"."survey_assignments" "sa" ON (("sr"."assignment_id" = "sa"."id")))
     JOIN "public"."survey_campaigns" "sc" ON (("sa"."campaign_id" = "sc"."id")))
     JOIN "public"."surveys" "s" ON (("sc"."survey_id" = "s"."id")))
  ORDER BY "sr"."created_at" DESC;


ALTER TABLE "public"."recent_activities" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."response_trends" AS
 SELECT "date_trunc"('day'::"text", "sr"."created_at") AS "response_date",
    "count"(*) AS "response_count",
    "count"(DISTINCT "sr"."user_id") AS "unique_respondents"
   FROM "public"."survey_responses" "sr"
  GROUP BY ("date_trunc"('day'::"text", "sr"."created_at"))
  ORDER BY ("date_trunc"('day'::"text", "sr"."created_at"));


ALTER TABLE "public"."response_trends" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."silent_employees" AS
 WITH "employee_participation" AS (
         SELECT "p"."id",
            "p"."first_name",
            "p"."last_name",
            "p"."email",
            "p"."designation",
            "l"."name" AS "level",
            "loc"."name" AS "location",
            COALESCE("sbu"."name", 'Unassigned'::"text") AS "sbu_name",
            "count"(DISTINCT "sr"."id") AS "total_responses",
            "max"("sr"."submitted_at") AS "last_response_date",
            "count"(DISTINCT "sa"."id") AS "total_assignments"
           FROM (((((("public"."profiles" "p"
             LEFT JOIN "public"."levels" "l" ON (("p"."level_id" = "l"."id")))
             LEFT JOIN "public"."locations" "loc" ON (("p"."location_id" = "loc"."id")))
             LEFT JOIN "public"."user_sbus" "us" ON ((("p"."id" = "us"."user_id") AND ("us"."is_primary" = true))))
             LEFT JOIN "public"."sbus" "sbu" ON (("us"."sbu_id" = "sbu"."id")))
             LEFT JOIN "public"."survey_assignments" "sa" ON (("p"."id" = "sa"."user_id")))
             LEFT JOIN "public"."survey_responses" "sr" ON (("sa"."id" = "sr"."assignment_id")))
          WHERE ("p"."status" = 'active'::"public"."profile_status")
          GROUP BY "p"."id", "p"."first_name", "p"."last_name", "p"."email", "p"."designation", "l"."name", "loc"."name", "sbu"."name"
        )
 SELECT "employee_participation"."id",
    "employee_participation"."first_name",
    "employee_participation"."last_name",
    "employee_participation"."email",
    "employee_participation"."designation",
    "employee_participation"."level",
    "employee_participation"."location",
    "employee_participation"."sbu_name",
    "employee_participation"."total_responses",
    "employee_participation"."last_response_date",
    "employee_participation"."total_assignments",
        CASE
            WHEN ("employee_participation"."total_assignments" = 0) THEN 'No Assignments'::"text"
            WHEN ("employee_participation"."total_responses" = 0) THEN 'Never Responded'::"text"
            ELSE 'Low Participation'::"text"
        END AS "participation_status"
   FROM "employee_participation"
  WHERE (("employee_participation"."total_responses" = 0) OR ((("employee_participation"."total_responses")::double precision / (NULLIF("employee_participation"."total_assignments", 0))::double precision) < (0.2)::double precision))
  ORDER BY "employee_participation"."total_assignments" DESC, "employee_participation"."last_response_date"
 LIMIT 10;


ALTER TABLE "public"."silent_employees" OWNER TO "postgres";


COMMENT ON VIEW "public"."silent_employees" IS 'Identifies employees with no survey responses or very low participation rates.
Includes employees who have never responded to surveys or have responded to less than 20% of their assignments.
Limited to top 10 cases that need attention.';



CREATE OR REPLACE VIEW "public"."survey_overview_metrics" AS
 WITH "metrics" AS (
         SELECT "count"(DISTINCT "s"."id") AS "total_surveys",
            "count"(DISTINCT
                CASE
                    WHEN ("sc"."status" = 'active'::"text") THEN "sc"."id"
                    ELSE NULL::"uuid"
                END) AS "active_campaigns",
            "count"(DISTINCT
                CASE
                    WHEN ("sc"."status" = 'completed'::"text") THEN "sc"."id"
                    ELSE NULL::"uuid"
                END) AS "completed_campaigns",
            "count"(DISTINCT "sr"."id") AS "total_responses",
            "round"("avg"(
                CASE
                    WHEN ("ci"."status" <> 'upcoming'::"public"."instance_status") THEN "ci"."completion_rate"
                    ELSE NULL::numeric
                END), 2) AS "avg_completion_rate"
           FROM (((("public"."surveys" "s"
             LEFT JOIN "public"."survey_campaigns" "sc" ON (("sc"."survey_id" = "s"."id")))
             LEFT JOIN "public"."campaign_instances" "ci" ON (("ci"."campaign_id" = "sc"."id")))
             LEFT JOIN "public"."survey_assignments" "sa" ON (("sa"."campaign_id" = "sc"."id")))
             LEFT JOIN "public"."survey_responses" "sr" ON (("sr"."assignment_id" = "sa"."id")))
        )
 SELECT "metrics"."total_surveys",
    "metrics"."active_campaigns",
    "metrics"."completed_campaigns",
    "metrics"."total_responses",
    COALESCE("metrics"."avg_completion_rate", (0)::numeric) AS "avg_completion_rate"
   FROM "metrics";


ALTER TABLE "public"."survey_overview_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."survey_response_trends" AS
 SELECT ("survey_responses"."created_at")::"date" AS "date",
    "count"(*) AS "response_count",
    "count"(DISTINCT "survey_responses"."user_id") AS "unique_respondents"
   FROM "public"."survey_responses"
  GROUP BY (("survey_responses"."created_at")::"date")
  ORDER BY (("survey_responses"."created_at")::"date") DESC;


ALTER TABLE "public"."survey_response_trends" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_performing_managers" AS
 WITH "rating_responses" AS (
         SELECT "sr"."user_id" AS "respondent_id",
            "us"."supervisor_id" AS "manager_id",
            ("s"."json_data" -> 'pages'::"text") AS "survey_pages",
            "sr"."response_data",
            "sr"."submitted_at"
           FROM ((("public"."survey_responses" "sr"
             JOIN "public"."survey_assignments" "sa" ON (("sr"."assignment_id" = "sa"."id")))
             JOIN "public"."surveys" "s" ON (("sa"."survey_id" = "s"."id")))
             JOIN "public"."user_supervisors" "us" ON (("sr"."user_id" = "us"."user_id")))
          WHERE (("sr"."submitted_at" IS NOT NULL) AND ("us"."is_primary" = true))
        ), "flattened_ratings" AS (
         SELECT "rr"."manager_id",
            "rr"."respondent_id",
            ("q"."value" ->> 'name'::"text") AS "question_name",
            ("q"."value" ->> 'type'::"text") AS "question_type",
                CASE
                    WHEN ((("q"."value" ->> 'rateCount'::"text"))::integer IS NOT NULL) THEN (("q"."value" ->> 'rateCount'::"text"))::integer
                    ELSE 5
                END AS "rate_scale",
            (("rr"."response_data" -> ("q"."value" ->> 'name'::"text")))::numeric AS "rating_value"
           FROM "rating_responses" "rr",
            LATERAL "jsonb_array_elements"("rr"."survey_pages") "pages"("value"),
            LATERAL "jsonb_array_elements"(("pages"."value" -> 'elements'::"text")) "q"("value")
          WHERE ((("q"."value" ->> 'type'::"text") = 'rating'::"text") AND ((("rr"."response_data" -> ("q"."value" ->> 'name'::"text")))::numeric IS NOT NULL))
        ), "manager_scores" AS (
         SELECT "fr"."manager_id",
            (("p"."first_name" || ' '::"text") || "p"."last_name") AS "manager_name",
            "count"(DISTINCT "fr"."respondent_id") AS "total_respondents",
            "count"("fr"."rating_value") AS "total_ratings",
            "round"("avg"((("fr"."rating_value" / ("fr"."rate_scale")::numeric) * (100)::numeric)), 2) AS "average_score"
           FROM ("flattened_ratings" "fr"
             JOIN "public"."profiles" "p" ON (("fr"."manager_id" = "p"."id")))
          GROUP BY "fr"."manager_id", "p"."first_name", "p"."last_name"
         HAVING ("count"(DISTINCT "fr"."respondent_id") >= 3)
        )
 SELECT "manager_scores"."manager_id",
    "manager_scores"."manager_name",
    "manager_scores"."total_respondents",
    "manager_scores"."total_ratings",
    "manager_scores"."average_score",
    "rank"() OVER (ORDER BY "manager_scores"."average_score" DESC) AS "rank"
   FROM "manager_scores"
  WHERE ("manager_scores"."average_score" > (0)::numeric)
 LIMIT 10;


ALTER TABLE "public"."top_performing_managers" OWNER TO "postgres";


COMMENT ON VIEW "public"."top_performing_managers" IS 'Shows top 10 managers based on weighted average of rating questions from surveys. 
Requires minimum 3 respondents per manager. Scores are normalized to percentage scale.';



CREATE OR REPLACE VIEW "public"."top_performing_sbus" AS
 WITH RECURSIVE "rating_responses" AS (
         SELECT "sr"."user_id",
            "us"."sbu_id",
            "s"."name" AS "sbu_name",
                CASE
                    WHEN (("q"."value" ->> 'rateMax'::"text") IS NOT NULL) THEN (((("sr"."response_data" ->> ("q"."value" ->> 'name'::"text")))::numeric / (("q"."value" ->> 'rateMax'::"text"))::numeric) * (5)::numeric)
                    ELSE (("sr"."response_data" ->> ("q"."value" ->> 'name'::"text")))::numeric
                END AS "normalized_rating"
           FROM (((((("public"."survey_responses" "sr"
             JOIN "public"."survey_assignments" "sa" ON (("sr"."assignment_id" = "sa"."id")))
             JOIN "public"."surveys" "surv" ON (("sa"."survey_id" = "surv"."id")))
             CROSS JOIN LATERAL "jsonb_array_elements"(("surv"."json_data" -> 'pages'::"text")) "page"("value"))
             CROSS JOIN LATERAL "jsonb_array_elements"(("page"."value" -> 'elements'::"text")) "q"("value"))
             JOIN "public"."user_sbus" "us" ON (("sr"."user_id" = "us"."user_id")))
             JOIN "public"."sbus" "s" ON (("us"."sbu_id" = "s"."id")))
          WHERE ((("q"."value" ->> 'type'::"text") = 'rating'::"text") AND ("sr"."response_data" ? ("q"."value" ->> 'name'::"text")) AND ("sr"."submitted_at" IS NOT NULL))
        ), "sbu_ratings" AS (
         SELECT "rating_responses"."sbu_id",
            "rating_responses"."sbu_name",
            "count"(DISTINCT "rating_responses"."user_id") AS "total_respondents",
            "count"(*) AS "total_ratings",
            ("avg"("rating_responses"."normalized_rating") * (20)::numeric) AS "average_score"
           FROM "rating_responses"
          GROUP BY "rating_responses"."sbu_id", "rating_responses"."sbu_name"
        )
 SELECT "sbu_ratings"."sbu_id",
    "sbu_ratings"."sbu_name",
    "sbu_ratings"."total_respondents",
    "sbu_ratings"."total_ratings",
    "round"("sbu_ratings"."average_score", 1) AS "average_score",
    "rank"() OVER (ORDER BY "sbu_ratings"."average_score" DESC) AS "rank"
   FROM "sbu_ratings"
  WHERE ("sbu_ratings"."average_score" IS NOT NULL);


ALTER TABLE "public"."top_performing_sbus" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_performing_surveys" AS
 WITH "latest_instances" AS (
         SELECT DISTINCT ON ("sc"."id") "sc"."id" AS "campaign_id",
            "sc"."name" AS "campaign_name",
            "s"."name" AS "survey_name",
            "ci"."completion_rate",
            "ci"."id" AS "instance_id",
            "ci"."period_number",
            "ci"."starts_at",
            "ci"."ends_at",
            "count"(DISTINCT "sr"."id") AS "total_responses"
           FROM (((("public"."survey_campaigns" "sc"
             JOIN "public"."surveys" "s" ON (("s"."id" = "sc"."survey_id")))
             JOIN "public"."campaign_instances" "ci" ON (("ci"."campaign_id" = "sc"."id")))
             LEFT JOIN "public"."survey_assignments" "sa" ON (("sa"."campaign_id" = "sc"."id")))
             LEFT JOIN "public"."survey_responses" "sr" ON ((("sr"."assignment_id" = "sa"."id") AND ("sr"."campaign_instance_id" = "ci"."id"))))
          WHERE (("ci"."status" = 'active'::"public"."instance_status") OR (("ci"."status" = 'completed'::"public"."instance_status") AND ("ci"."ends_at" = ( SELECT "max"("campaign_instances"."ends_at") AS "max"
                   FROM "public"."campaign_instances"
                  WHERE ("campaign_instances"."campaign_id" = "sc"."id")))))
          GROUP BY "sc"."id", "sc"."name", "s"."name", "ci"."id", "ci"."completion_rate", "ci"."period_number", "ci"."starts_at", "ci"."ends_at"
          ORDER BY "sc"."id", "ci"."period_number" DESC
        )
 SELECT "latest_instances"."campaign_id",
    "latest_instances"."campaign_name",
    "latest_instances"."survey_name",
    "latest_instances"."completion_rate",
    "latest_instances"."total_responses",
    "latest_instances"."instance_id",
    "latest_instances"."period_number",
    "latest_instances"."starts_at",
    "latest_instances"."ends_at"
   FROM "latest_instances"
  ORDER BY "latest_instances"."completion_rate" DESC NULLS LAST
 LIMIT 5;


ALTER TABLE "public"."top_performing_surveys" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."upcoming_survey_deadlines" AS
 SELECT "ci"."id",
    "ci"."campaign_id",
    "s"."name" AS "survey_name",
    "sc"."name" AS "campaign_name",
    "ci"."ends_at",
    "count"(DISTINCT "sa"."id") AS "total_assignments",
    "count"(DISTINCT "sa"."id") FILTER (WHERE (NOT (EXISTS ( SELECT 1
           FROM "public"."survey_responses" "sr"
          WHERE (("sr"."assignment_id" = "sa"."id") AND ("sr"."campaign_instance_id" = "ci"."id") AND ("sr"."status" = 'submitted'::"public"."response_status")))))) AS "pending_responses"
   FROM ((("public"."campaign_instances" "ci"
     JOIN "public"."survey_campaigns" "sc" ON (("ci"."campaign_id" = "sc"."id")))
     JOIN "public"."surveys" "s" ON (("sc"."survey_id" = "s"."id")))
     JOIN "public"."survey_assignments" "sa" ON (("sa"."campaign_id" = "sc"."id")))
  WHERE (("ci"."status" = 'active'::"public"."instance_status") AND ("ci"."ends_at" > "now"()))
  GROUP BY "ci"."id", "ci"."campaign_id", "s"."name", "sc"."name", "ci"."ends_at"
  ORDER BY "ci"."ends_at";


ALTER TABLE "public"."upcoming_survey_deadlines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "progress" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analysis_prompts"
    ADD CONSTRAINT "analysis_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_cron_job_logs"
    ADD CONSTRAINT "campaign_cron_job_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_cron_jobs"
    ADD CONSTRAINT "campaign_cron_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_instance_status_logs"
    ADD CONSTRAINT "campaign_instance_status_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "campaign_instances_campaign_id_period_number_key" UNIQUE ("campaign_id", "period_number");



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "campaign_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_config"
    ADD CONSTRAINT "email_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_config"
    ADD CONSTRAINT "email_config_provider_key" UNIQUE ("provider");



ALTER TABLE ONLY "public"."email_responses"
    ADD CONSTRAINT "email_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_roles"
    ADD CONSTRAINT "employee_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_types"
    ADD CONSTRAINT "employee_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employment_types"
    ADD CONSTRAINT "employment_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issue_board_permissions"
    ADD CONSTRAINT "issue_board_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issue_boards"
    ADD CONSTRAINT "issue_boards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issue_downvotes"
    ADD CONSTRAINT "issue_downvotes_issue_id_user_id_key" UNIQUE ("issue_id", "user_id");



ALTER TABLE ONLY "public"."issue_downvotes"
    ADD CONSTRAINT "issue_downvotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issue_votes"
    ADD CONSTRAINT "issue_votes_issue_id_user_id_key" UNIQUE ("issue_id", "user_id");



ALTER TABLE ONLY "public"."issue_votes"
    ADD CONSTRAINT "issue_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_session_participants"
    ADD CONSTRAINT "live_session_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_session_questions"
    ADD CONSTRAINT "live_session_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_session_responses"
    ADD CONSTRAINT "live_session_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_survey_sessions"
    ADD CONSTRAINT "live_survey_sessions_join_code_key" UNIQUE ("join_code");



ALTER TABLE ONLY "public"."live_survey_sessions"
    ADD CONSTRAINT "live_survey_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbus"
    ADD CONSTRAINT "sbus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "survey_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_campaigns"
    ADD CONSTRAINT "survey_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_assignment_user_instance_key" UNIQUE ("assignment_id", "user_id", "campaign_instance_id") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_session_responses"
    ADD CONSTRAINT "unique_participant_response" UNIQUE ("session_id", "participant_id", "question_key");



ALTER TABLE ONLY "public"."user_supervisors"
    ADD CONSTRAINT "unique_user_supervisor" UNIQUE ("user_id", "supervisor_id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_sbus"
    ADD CONSTRAINT "user_sbus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sbus"
    ADD CONSTRAINT "user_sbus_user_id_sbu_id_key" UNIQUE ("user_id", "sbu_id");



ALTER TABLE ONLY "public"."user_supervisors"
    ADD CONSTRAINT "user_supervisors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_issue_board_permissions_board_id" ON "public"."issue_board_permissions" USING "btree" ("board_id");



CREATE INDEX "idx_issue_votes_issue_id" ON "public"."issue_votes" USING "btree" ("issue_id");



CREATE INDEX "idx_issue_votes_user_id" ON "public"."issue_votes" USING "btree" ("user_id");



CREATE INDEX "idx_issues_board_id" ON "public"."issues" USING "btree" ("board_id");



CREATE INDEX "idx_live_session_participants_session" ON "public"."live_session_participants" USING "btree" ("session_id");



CREATE INDEX "idx_live_session_participants_status" ON "public"."live_session_participants" USING "btree" ("status");



CREATE INDEX "idx_live_session_questions_session_id" ON "public"."live_session_questions" USING "btree" ("session_id");



CREATE INDEX "idx_live_session_responses_question_key" ON "public"."live_session_responses" USING "btree" ("question_key");



CREATE INDEX "idx_live_survey_sessions_join_code" ON "public"."live_survey_sessions" USING "btree" ("join_code");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_email_pattern" ON "public"."profiles" USING "btree" ("email" "text_pattern_ops");



CREATE INDEX "idx_profiles_first_name" ON "public"."profiles" USING "btree" ("first_name");



CREATE INDEX "idx_profiles_first_name_pattern" ON "public"."profiles" USING "btree" ("first_name" "text_pattern_ops");



CREATE INDEX "idx_profiles_last_name" ON "public"."profiles" USING "btree" ("last_name");



CREATE INDEX "idx_profiles_last_name_pattern" ON "public"."profiles" USING "btree" ("last_name" "text_pattern_ops");



CREATE INDEX "idx_profiles_org_id" ON "public"."profiles" USING "btree" ("org_id");



CREATE INDEX "idx_profiles_org_id_pattern" ON "public"."profiles" USING "btree" ("org_id" "text_pattern_ops");



CREATE INDEX "idx_sbus_head_id" ON "public"."sbus" USING "btree" ("head_id");



CREATE INDEX "idx_survey_assignments_campaign_id" ON "public"."survey_assignments" USING "btree" ("campaign_id");



CREATE INDEX "idx_survey_assignments_last_reminder" ON "public"."survey_assignments" USING "btree" ("last_reminder_sent");



CREATE UNIQUE INDEX "idx_survey_assignments_public_access_token" ON "public"."survey_assignments" USING "btree" ("public_access_token");



CREATE INDEX "idx_survey_assignments_survey_id" ON "public"."survey_assignments" USING "btree" ("survey_id");



CREATE INDEX "idx_survey_assignments_user_id" ON "public"."survey_assignments" USING "btree" ("user_id");



CREATE INDEX "idx_survey_campaigns_survey_id" ON "public"."survey_campaigns" USING "btree" ("survey_id");



CREATE INDEX "idx_survey_responses_assignment_id" ON "public"."survey_responses" USING "btree" ("assignment_id");



CREATE UNIQUE INDEX "unique_user_assignment_instance" ON "public"."survey_responses" USING "btree" ("assignment_id", "user_id", "campaign_instance_id") WHERE ("status" <> 'submitted'::"public"."response_status");



CREATE OR REPLACE TRIGGER "before_delete_campaign" BEFORE DELETE ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."delete_campaign_cascade"();



CREATE OR REPLACE TRIGGER "campaign_completion_trigger" AFTER UPDATE ON "public"."campaign_instances" FOR EACH ROW WHEN ((("old"."status" <> 'completed'::"public"."instance_status") AND ("new"."status" = 'completed'::"public"."instance_status"))) EXECUTE FUNCTION "public"."handle_campaign_completion"();



CREATE OR REPLACE TRIGGER "campaign_scheduling_trigger" AFTER INSERT ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."handle_campaign_scheduling"();



CREATE OR REPLACE TRIGGER "check_achievements_after_survey" AFTER INSERT OR UPDATE OF "status" ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_check_achievements"();



CREATE OR REPLACE TRIGGER "create_live_session_questions" AFTER INSERT ON "public"."live_survey_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_live_session_questions"();



CREATE OR REPLACE TRIGGER "ensure_public_access_token" BEFORE INSERT ON "public"."survey_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."generate_public_access_token"();



CREATE OR REPLACE TRIGGER "generate_instances_trigger" AFTER INSERT ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."generate_initial_instances"();



CREATE OR REPLACE TRIGGER "issue_downvote_count_trigger" AFTER INSERT OR DELETE ON "public"."issue_downvotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_issue_downvote_count"();



CREATE OR REPLACE TRIGGER "link_response_to_active_instance_trigger" BEFORE INSERT ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."link_response_to_active_instance"();



CREATE OR REPLACE TRIGGER "prevent_duplicate_responses_trigger" BEFORE INSERT ON "public"."live_session_responses" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_duplicate_responses"();



CREATE OR REPLACE TRIGGER "prevent_submitted_response_modification" BEFORE UPDATE ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_modifying_submitted_responses"();



CREATE OR REPLACE TRIGGER "question_activation_trigger" BEFORE UPDATE ON "public"."live_session_questions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_question_activation"();



CREATE OR REPLACE TRIGGER "update_achievement_progress_updated_at" BEFORE UPDATE ON "public"."achievement_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_achievements_updated_at" BEFORE UPDATE ON "public"."achievements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_analysis_prompts_updated_at" BEFORE UPDATE ON "public"."analysis_prompts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campaign_instances_updated_at" BEFORE UPDATE ON "public"."campaign_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_messages_updated_at" BEFORE UPDATE ON "public"."contact_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_config_updated_at" BEFORE UPDATE ON "public"."email_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_responses_updated_at" BEFORE UPDATE ON "public"."email_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employee_roles_updated_at" BEFORE UPDATE ON "public"."employee_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employee_types_updated_at" BEFORE UPDATE ON "public"."employee_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employment_types_updated_at" BEFORE UPDATE ON "public"."employment_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instance_completion_rate_on_response" AFTER INSERT OR UPDATE ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_instance_completion_rate"();



CREATE OR REPLACE TRIGGER "update_issue_board_permissions_updated_at" BEFORE UPDATE ON "public"."issue_board_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_issue_boards_updated_at" BEFORE UPDATE ON "public"."issue_boards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_issues_updated_at" BEFORE UPDATE ON "public"."issues" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_levels_updated_at" BEFORE UPDATE ON "public"."levels" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_participants_updated_at" BEFORE UPDATE ON "public"."live_session_participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_questions_updated_at" BEFORE UPDATE ON "public"."live_session_questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_responses_updated_at" BEFORE UPDATE ON "public"."live_session_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_survey_sessions_updated_at" BEFORE UPDATE ON "public"."live_survey_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sbus_updated_at" BEFORE UPDATE ON "public"."sbus" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_survey_assignments_updated_at" BEFORE UPDATE ON "public"."survey_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_survey_campaigns_updated_at" BEFORE UPDATE ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_survey_responses_updated_at" BEFORE UPDATE ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_surveys_updated_at" BEFORE UPDATE ON "public"."surveys" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_achievements_updated_at" BEFORE UPDATE ON "public"."user_achievements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_sbus_updated_at" BEFORE UPDATE ON "public"."user_sbus" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_supervisors_updated_at" BEFORE UPDATE ON "public"."user_supervisors" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vote_count" AFTER INSERT OR DELETE ON "public"."issue_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_issue_vote_count"();



CREATE OR REPLACE TRIGGER "validate_campaign_dates_trigger" BEFORE INSERT OR UPDATE ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."validate_campaign_dates"();



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_cron_job_logs"
    ADD CONSTRAINT "campaign_cron_job_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_cron_jobs"
    ADD CONSTRAINT "campaign_cron_jobs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "campaign_instances_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "fk_campaign_instances_campaign" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "fk_survey_assignments_campaign" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issue_board_permissions"
    ADD CONSTRAINT "issue_board_permissions_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."issue_boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issue_boards"
    ADD CONSTRAINT "issue_boards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."issue_downvotes"
    ADD CONSTRAINT "issue_downvotes_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issue_downvotes"
    ADD CONSTRAINT "issue_downvotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issue_votes"
    ADD CONSTRAINT "issue_votes_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issue_votes"
    ADD CONSTRAINT "issue_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."issue_boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."live_session_participants"
    ADD CONSTRAINT "live_session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."live_survey_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."live_session_questions"
    ADD CONSTRAINT "live_session_questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."live_survey_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."live_session_responses"
    ADD CONSTRAINT "live_session_responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."live_survey_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."live_survey_sessions"
    ADD CONSTRAINT "live_survey_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."live_survey_sessions"
    ADD CONSTRAINT "live_survey_sessions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_employee_role_id_fkey" FOREIGN KEY ("employee_role_id") REFERENCES "public"."employee_roles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_employee_type_id_fkey" FOREIGN KEY ("employee_type_id") REFERENCES "public"."employee_types"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_employment_type_id_fkey" FOREIGN KEY ("employment_type_id") REFERENCES "public"."employment_types"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."sbus"
    ADD CONSTRAINT "sbus_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "survey_assignments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id");



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "survey_assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "survey_assignments_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_assignments"
    ADD CONSTRAINT "survey_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "survey_assignments_user_id_fkey" ON "public"."survey_assignments" IS 'Cascade deletes survey assignments when a user is deleted';



ALTER TABLE ONLY "public"."survey_campaigns"
    ADD CONSTRAINT "survey_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."survey_campaigns"
    ADD CONSTRAINT "survey_campaigns_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id");



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."survey_assignments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_campaign_instance_id_fkey" FOREIGN KEY ("campaign_instance_id") REFERENCES "public"."campaign_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."survey_responses"
    ADD CONSTRAINT "survey_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "survey_responses_user_id_fkey" ON "public"."survey_responses" IS 'Cascade deletes survey responses when a user is deleted';



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sbus"
    ADD CONSTRAINT "user_sbus_sbu_id_fkey" FOREIGN KEY ("sbu_id") REFERENCES "public"."sbus"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sbus"
    ADD CONSTRAINT "user_sbus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "user_sbus_user_id_fkey" ON "public"."user_sbus" IS 'Cascade deletes user SBU assignments when a user is deleted';



ALTER TABLE ONLY "public"."user_supervisors"
    ADD CONSTRAINT "user_supervisors_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_supervisors"
    ADD CONSTRAINT "user_supervisors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "user_supervisors_user_id_fkey" ON "public"."user_supervisors" IS 'Cascade deletes supervisor relationships when a user is deleted';



CREATE POLICY "Admins can delete prompts" ON "public"."analysis_prompts" FOR DELETE TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete roles" ON "public"."user_roles" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can do all operations on email_config" ON "public"."email_config" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on employee_roles" ON "public"."employee_roles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on employee_types" ON "public"."employee_types" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on employment_types" ON "public"."employment_types" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on levels" ON "public"."levels" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on locations" ON "public"."locations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on sbus" ON "public"."sbus" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on survey_campaigns" ON "public"."survey_campaigns" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on surveys" ON "public"."surveys" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can do all operations on user_sbus" ON "public"."user_sbus" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can hard delete surveys" ON "public"."surveys" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert prompts" ON "public"."analysis_prompts" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can insert roles" ON "public"."user_roles" FOR INSERT WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can manage issue boards" ON "public"."issue_boards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage permissions" ON "public"."issue_board_permissions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can read all prompts" ON "public"."analysis_prompts" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can update all profiles" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update prompts" ON "public"."analysis_prompts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can update roles" ON "public"."user_roles" FOR UPDATE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can update user status" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can use search_users function" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Allow admin to manage achievements" ON "public"."achievements" TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow anonymous insert for active sessions" ON "public"."live_session_participants" FOR INSERT TO "authenticated", "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."live_survey_sessions" "s"
  WHERE (("s"."id" = "live_session_participants"."session_id") AND ("s"."status" = ANY (ARRAY['initial'::"public"."session_status", 'active'::"public"."session_status"]))))));



CREATE POLICY "Allow participants to submit responses" ON "public"."live_session_responses" FOR INSERT TO "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."live_session_participants"
  WHERE (("live_session_participants"."session_id" = "live_session_responses"."session_id") AND ("live_session_participants"."participant_id" = "auth"."uid"()) AND ("live_session_participants"."status" = 'connected'::"text")))));



CREATE POLICY "Allow public access to survey assignments with token" ON "public"."survey_assignments" FOR SELECT USING ((("public_access_token" IS NOT NULL) OR ("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow public access to surveys via assignment token" ON "public"."surveys" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."survey_id" = "surveys"."id") AND ("survey_assignments"."public_access_token" IS NOT NULL)))));



CREATE POLICY "Allow public creation of survey responses via token" ON "public"."survey_responses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."id" = "survey_responses"."assignment_id") AND ("survey_assignments"."public_access_token" IS NOT NULL)))));



CREATE POLICY "Allow public read access to achievements" ON "public"."achievements" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow reading active sessions by join code" ON "public"."live_survey_sessions" FOR SELECT TO "anon" USING (("status" = ANY (ARRAY['initial'::"public"."session_status", 'active'::"public"."session_status"])));



CREATE POLICY "Allow reading campaign instances" ON "public"."campaign_instances" FOR SELECT USING (true);



CREATE POLICY "Allow reading participants for active sessions" ON "public"."live_session_participants" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."live_survey_sessions" "s"
  WHERE (("s"."id" = "live_session_participants"."session_id") AND ("s"."status" = ANY (ARRAY['initial'::"public"."session_status", 'active'::"public"."session_status"]))))));



CREATE POLICY "Allow system updates on survey_responses" ON "public"."survey_responses" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow trigger-based updates on survey_assignments" ON "public"."survey_assignments" FOR UPDATE USING (("public_access_token" IS NOT NULL)) WITH CHECK (("public_access_token" IS NOT NULL));



CREATE POLICY "Allow updating last_reminder_sent" ON "public"."survey_assignments" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))) OR ("created_by" = "auth"."uid"()))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow users to view responses in their sessions" ON "public"."live_session_responses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."live_survey_sessions"
  WHERE (("live_survey_sessions"."id" = "live_session_responses"."session_id") AND ("live_survey_sessions"."created_by" = "auth"."uid"())))));



CREATE POLICY "Can insert own responses" ON "public"."live_session_responses" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."live_session_participants" "lsp"
  WHERE (("lsp"."session_id" = "live_session_responses"."session_id") AND ("lsp"."participant_id" = "live_session_responses"."participant_id")))) AND (EXISTS ( SELECT 1
   FROM "public"."live_session_questions" "lsq"
  WHERE (("lsq"."session_id" = "live_session_responses"."session_id") AND ("lsq"."question_key" = "live_session_responses"."question_key") AND ("lsq"."status" = 'active'::"text"))))));



CREATE POLICY "Can read responses for participated sessions" ON "public"."live_session_responses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."live_session_participants" "lsp"
  WHERE (("lsp"."session_id" = "live_session_responses"."session_id") AND ("lsp"."participant_id" = "auth"."uid"())))));



CREATE POLICY "Enable insert for authenticated users" ON "public"."live_session_responses" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read access for all authenticated users" ON "public"."live_survey_sessions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."issue_boards" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."issue_votes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."live_session_questions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."live_session_responses" FOR SELECT USING (true);



CREATE POLICY "Enable system to insert achievement progress" ON "public"."achievement_progress" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable system to insert achievements" ON "public"."user_achievements" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable system to update achievement progress" ON "public"."achievement_progress" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable system to update achievements" ON "public"."user_achievements" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable write access for creators and admins" ON "public"."live_survey_sessions" TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))))) WITH CHECK ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Enable write access for session creators" ON "public"."live_session_questions" USING ((EXISTS ( SELECT 1
   FROM "public"."live_survey_sessions" "s"
  WHERE (("s"."id" = "live_session_questions"."session_id") AND ("s"."created_by" = "auth"."uid"())))));



CREATE POLICY "Only admins can modify campaign instances" ON "public"."campaign_instances" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "System can manage user achievements" ON "public"."user_achievements" TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Users can create issues in boards they have access to" ON "public"."issues" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM (("public"."issue_board_permissions" "ibp"
     JOIN "public"."profiles" "p" ON (("auth"."uid"() = "p"."id")))
     LEFT JOIN "public"."user_sbus" "us" ON (("p"."id" = "us"."user_id")))
  WHERE (("ibp"."board_id" = "issues"."board_id") AND (("ibp"."level_ids" IS NULL) OR ("ibp"."level_ids" = '{}'::"uuid"[]) OR ("p"."level_id" = ANY ("ibp"."level_ids")) OR (("ibp"."location_ids" IS NULL) OR ("ibp"."location_ids" = '{}'::"uuid"[]) OR ("p"."location_id" = ANY ("ibp"."location_ids"))) OR (("ibp"."employment_type_ids" IS NULL) OR ("ibp"."employment_type_ids" = '{}'::"uuid"[]) OR ("p"."employment_type_id" = ANY ("ibp"."employment_type_ids"))) OR (("ibp"."employee_type_ids" IS NULL) OR ("ibp"."employee_type_ids" = '{}'::"uuid"[]) OR ("p"."employee_type_id" = ANY ("ibp"."employee_type_ids"))) OR (("ibp"."employee_role_ids" IS NULL) OR ("ibp"."employee_role_ids" = '{}'::"uuid"[]) OR ("p"."employee_role_id" = ANY ("ibp"."employee_role_ids"))) OR (("ibp"."sbu_ids" IS NULL) OR ("ibp"."sbu_ids" = '{}'::"uuid"[]) OR ("us"."sbu_id" = ANY ("ibp"."sbu_ids")))) AND ("ibp"."can_create" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can delete their own issues or if admin" ON "public"."issues" FOR DELETE USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can delete their own votes" ON "public"."issue_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own votes" ON "public"."issue_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own votes" ON "public"."issue_votes" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."issues" "i"
     JOIN "public"."issue_board_permissions" "ibp" ON (("i"."board_id" = "ibp"."board_id")))
  WHERE (("i"."id" = "issue_votes"."issue_id") AND ("ibp"."can_vote" = true))))));



CREATE POLICY "Users can only view their own achievement progress" ON "public"."achievement_progress" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read active prompts" ON "public"."analysis_prompts" FOR SELECT TO "authenticated" USING (("status" = 'active'::"public"."prompt_status"));



CREATE POLICY "Users can read any board permissions" ON "public"."issue_board_permissions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."issue_boards" "b"
  WHERE (("b"."id" = "issue_board_permissions"."board_id") AND ("b"."status" = 'active'::"public"."issue_board_status")))));



CREATE POLICY "Users can read issues in boards they have access to" ON "public"."issues" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM (("public"."issue_board_permissions" "ibp"
     JOIN "public"."profiles" "p" ON (("auth"."uid"() = "p"."id")))
     LEFT JOIN "public"."user_sbus" "us" ON (("p"."id" = "us"."user_id")))
  WHERE (("ibp"."board_id" = "issues"."board_id") AND (("ibp"."level_ids" IS NULL) OR ("ibp"."level_ids" = '{}'::"uuid"[]) OR ("p"."level_id" = ANY ("ibp"."level_ids")) OR (("ibp"."location_ids" IS NULL) OR ("ibp"."location_ids" = '{}'::"uuid"[]) OR ("p"."location_id" = ANY ("ibp"."location_ids"))) OR (("ibp"."employment_type_ids" IS NULL) OR ("ibp"."employment_type_ids" = '{}'::"uuid"[]) OR ("p"."employment_type_id" = ANY ("ibp"."employment_type_ids"))) OR (("ibp"."employee_type_ids" IS NULL) OR ("ibp"."employee_type_ids" = '{}'::"uuid"[]) OR ("p"."employee_type_id" = ANY ("ibp"."employee_type_ids"))) OR (("ibp"."employee_role_ids" IS NULL) OR ("ibp"."employee_role_ids" = '{}'::"uuid"[]) OR ("p"."employee_role_id" = ANY ("ibp"."employee_role_ids"))) OR (("ibp"."sbu_ids" IS NULL) OR ("ibp"."sbu_ids" = '{}'::"uuid"[]) OR ("us"."sbu_id" = ANY ("ibp"."sbu_ids")))) AND ("ibp"."can_view" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))) OR ("auth"."uid"() = "created_by")));



CREATE POLICY "Users can read votes on accessible issues" ON "public"."issue_votes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."issues" "i"
  WHERE (("i"."id" = "issue_votes"."issue_id") AND ((EXISTS ( SELECT 1
           FROM (("public"."issue_board_permissions" "ibp"
             JOIN "public"."profiles" "p" ON (("auth"."uid"() = "p"."id")))
             LEFT JOIN "public"."user_sbus" "us" ON (("p"."id" = "us"."user_id")))
          WHERE (("ibp"."board_id" = "i"."board_id") AND (("ibp"."level_ids" IS NULL) OR ("ibp"."level_ids" = '{}'::"uuid"[]) OR ("p"."level_id" = ANY ("ibp"."level_ids")) OR (("ibp"."location_ids" IS NULL) OR ("ibp"."location_ids" = '{}'::"uuid"[]) OR ("p"."location_id" = ANY ("ibp"."location_ids"))) OR (("ibp"."employment_type_ids" IS NULL) OR ("ibp"."employment_type_ids" = '{}'::"uuid"[]) OR ("p"."employment_type_id" = ANY ("ibp"."employment_type_ids"))) OR (("ibp"."employee_type_ids" IS NULL) OR ("ibp"."employee_type_ids" = '{}'::"uuid"[]) OR ("p"."employee_type_id" = ANY ("ibp"."employee_type_ids"))) OR (("ibp"."employee_role_ids" IS NULL) OR ("ibp"."employee_role_ids" = '{}'::"uuid"[]) OR ("p"."employee_role_id" = ANY ("ibp"."employee_role_ids"))) OR (("ibp"."sbu_ids" IS NULL) OR ("ibp"."sbu_ids" = '{}'::"uuid"[]) OR ("us"."sbu_id" = ANY ("ibp"."sbu_ids")))) AND ("ibp"."can_view" = true)))) OR ("auth"."uid"() = "i"."created_by") OR (EXISTS ( SELECT 1
           FROM "public"."user_roles"
          WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))))))));



CREATE POLICY "Users can update their extended profile fields" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))))) WITH CHECK ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can update their own issues" ON "public"."issues" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update/delete their own issues" ON "public"."issues" USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can view active employee roles" ON "public"."employee_roles" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active employee types" ON "public"."employee_types" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active employment types" ON "public"."employment_types" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active levels" ON "public"."levels" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view all locations" ON "public"."locations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view campaigns they're assigned to" ON "public"."survey_campaigns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."campaign_id" = "survey_campaigns"."id") AND ("survey_assignments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view instances of campaigns they're assigned to" ON "public"."campaign_instances" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."campaign_id" = "campaign_instances"."campaign_id") AND ("survey_assignments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view profiles with extended fields" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can view responses for campaigns they manage" ON "public"."survey_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."survey_assignments" "sa"
     JOIN "public"."survey_campaigns" "sc" ON (("sa"."campaign_id" = "sc"."id")))
  WHERE (("sa"."id" = "survey_responses"."assignment_id") AND (("sc"."created_by" = "auth"."uid"()) OR ("sa"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view surveys assigned to them" ON "public"."surveys" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."survey_id" = "surveys"."id") AND ("survey_assignments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own achievement progress" ON "public"."achievement_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own achievements" ON "public"."user_achievements" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own role" ON "public"."user_roles" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"("auth"."uid"())));



ALTER TABLE "public"."achievement_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_all_survey_assignments" ON "public"."survey_assignments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "admin_all_survey_responses" ON "public"."survey_responses" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "admin_all_user_supervisors" ON "public"."user_supervisors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."analysis_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employment_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_board_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."live_session_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."live_session_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."live_session_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."live_survey_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "manage_own_responses" ON "public"."survey_responses" TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."id" = "survey_responses"."assignment_id") AND ("survey_assignments"."user_id" = "auth"."uid"())))))) WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."id" = "survey_responses"."assignment_id") AND ("survey_assignments"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_issues_policy" ON "public"."issues" FOR SELECT USING (true);



ALTER TABLE "public"."sbus" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surveys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_own_assignments" ON "public"."survey_assignments" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "update_vote_count_policy" ON "public"."issues" FOR UPDATE USING (true) WITH CHECK (true);



ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sbus" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_supervisors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "view_own_assignments" ON "public"."survey_assignments" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_supervisors"
  WHERE (("user_supervisors"."supervisor_id" = "auth"."uid"()) AND ("user_supervisors"."user_id" = "survey_assignments"."user_id"))))));



CREATE POLICY "view_own_responses" ON "public"."survey_responses" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "view_own_supervisors" ON "public"."user_supervisors" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "supervisor_id")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."live_session_participants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."live_session_questions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."live_session_responses";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






GRANT ALL ON TYPE "public"."achievement_category" TO "authenticated";



GRANT ALL ON TYPE "public"."achievement_condition_type" TO "authenticated";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;




















































































































































































GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_campaign_cron_jobs"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_campaign_cron_jobs"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_campaign_cron_jobs"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_vote_count"("issue_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_vote_count"("issue_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_vote_count"("issue_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user_complete"("in_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_campaign_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_campaign_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_campaign_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_survey_assignment"("p_assignment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_survey_assignment"("p_assignment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_survey_assignment"("p_assignment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_missing_campaign_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_missing_campaign_jobs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_missing_campaign_jobs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_campaign_cron_schedule"("p_timestamp" timestamp with time zone, "p_recurring_frequency" "text", "p_job_type" "public"."cron_job_type") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_campaign_cron_schedule"("p_timestamp" timestamp with time zone, "p_recurring_frequency" "text", "p_job_type" "public"."cron_job_type") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_campaign_cron_schedule"("p_timestamp" timestamp with time zone, "p_recurring_frequency" "text", "p_job_type" "public"."cron_job_type") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_initial_instances"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_initial_instances"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_initial_instances"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_public_access_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_public_access_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_public_access_token"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assignment_instance_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_assignment_instance_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assignment_instance_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_instance_status_distribution"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_instance_status_distribution"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_instance_status_distribution"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_campaign_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_campaign_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_campaign_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_campaign_end"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_campaign_end"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_campaign_end"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_campaign_scheduling"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_campaign_scheduling"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_campaign_scheduling"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_instance_due_time"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_instance_due_time"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_instance_due_time"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_question_activation"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_question_activation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_question_activation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_vote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_vote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_vote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_vote_count"("issue_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_vote_count"("issue_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_vote_count"("issue_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."link_response_to_active_instance"() TO "anon";
GRANT ALL ON FUNCTION "public"."link_response_to_active_instance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_response_to_active_instance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schedule_campaign_cron_job"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."schedule_campaign_cron_job"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schedule_campaign_cron_job"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."schedule_campaign_jobs"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."schedule_campaign_jobs"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schedule_campaign_jobs"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_instance_completion_rate"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_instance_completion_rate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_instance_completion_rate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_issue_downvote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_issue_downvote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_issue_downvote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_issue_vote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_issue_vote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_issue_vote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_campaign_dates"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_campaign_dates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_campaign_dates"() TO "service_role";
























GRANT ALL ON TABLE "public"."achievement_progress" TO "anon";
GRANT ALL ON TABLE "public"."achievement_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_progress" TO "service_role";



GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_prompts" TO "anon";
GRANT ALL ON TABLE "public"."analysis_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_prompts" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_cron_job_logs" TO "anon";
GRANT ALL ON TABLE "public"."campaign_cron_job_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_cron_job_logs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_cron_jobs" TO "anon";
GRANT ALL ON TABLE "public"."campaign_cron_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_cron_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "anon";
GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_instances" TO "anon";
GRANT ALL ON TABLE "public"."campaign_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_instances" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."employee_roles" TO "anon";
GRANT ALL ON TABLE "public"."employee_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_roles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."survey_responses" TO "anon";
GRANT ALL ON TABLE "public"."survey_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_responses" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_employee_role_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_employee_role_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_employee_role_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."employee_types" TO "anon";
GRANT ALL ON TABLE "public"."employee_types" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_types" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_employee_type_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_employee_type_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_employee_type_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."employment_types" TO "anon";
GRANT ALL ON TABLE "public"."employment_types" TO "authenticated";
GRANT ALL ON TABLE "public"."employment_types" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_employment_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_employment_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_employment_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_gender_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_gender_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_gender_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."levels" TO "anon";
GRANT ALL ON TABLE "public"."levels" TO "authenticated";
GRANT ALL ON TABLE "public"."levels" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_level_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_level_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_level_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."demographic_location_analysis" TO "anon";
GRANT ALL ON TABLE "public"."demographic_location_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."demographic_location_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."sbus" TO "anon";
GRANT ALL ON TABLE "public"."sbus" TO "authenticated";
GRANT ALL ON TABLE "public"."sbus" TO "service_role";



GRANT ALL ON TABLE "public"."survey_assignments" TO "anon";
GRANT ALL ON TABLE "public"."survey_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."user_sbus" TO "anon";
GRANT ALL ON TABLE "public"."user_sbus" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sbus" TO "service_role";



GRANT ALL ON TABLE "public"."department_performance" TO "anon";
GRANT ALL ON TABLE "public"."department_performance" TO "authenticated";
GRANT ALL ON TABLE "public"."department_performance" TO "service_role";



GRANT ALL ON TABLE "public"."email_config" TO "anon";
GRANT ALL ON TABLE "public"."email_config" TO "authenticated";
GRANT ALL ON TABLE "public"."email_config" TO "service_role";



GRANT ALL ON TABLE "public"."email_responses" TO "anon";
GRANT ALL ON TABLE "public"."email_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."email_responses" TO "service_role";



GRANT ALL ON TABLE "public"."instance_comparison_metrics" TO "anon";
GRANT ALL ON TABLE "public"."instance_comparison_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."instance_comparison_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."instance_question_comparison" TO "anon";
GRANT ALL ON TABLE "public"."instance_question_comparison" TO "authenticated";
GRANT ALL ON TABLE "public"."instance_question_comparison" TO "service_role";



GRANT ALL ON TABLE "public"."issue_board_permissions" TO "anon";
GRANT ALL ON TABLE "public"."issue_board_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."issue_board_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."issue_boards" TO "anon";
GRANT ALL ON TABLE "public"."issue_boards" TO "authenticated";
GRANT ALL ON TABLE "public"."issue_boards" TO "service_role";



GRANT ALL ON TABLE "public"."issue_downvotes" TO "anon";
GRANT ALL ON TABLE "public"."issue_downvotes" TO "authenticated";
GRANT ALL ON TABLE "public"."issue_downvotes" TO "service_role";



GRANT ALL ON TABLE "public"."issue_votes" TO "anon";
GRANT ALL ON TABLE "public"."issue_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."issue_votes" TO "service_role";



GRANT ALL ON TABLE "public"."issues" TO "anon";
GRANT ALL ON TABLE "public"."issues" TO "authenticated";
GRANT ALL ON TABLE "public"."issues" TO "service_role";



GRANT ALL ON TABLE "public"."live_session_participants" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."live_session_participants" TO "anon";
GRANT SELECT,INSERT ON TABLE "public"."live_session_participants" TO "authenticated";



GRANT ALL ON TABLE "public"."live_session_questions" TO "anon";
GRANT ALL ON TABLE "public"."live_session_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."live_session_questions" TO "service_role";



GRANT ALL ON TABLE "public"."live_session_responses" TO "anon";
GRANT ALL ON TABLE "public"."live_session_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."live_session_responses" TO "service_role";



GRANT ALL ON TABLE "public"."live_survey_sessions" TO "anon";
GRANT ALL ON TABLE "public"."live_survey_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."live_survey_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."surveys" TO "anon";
GRANT ALL ON TABLE "public"."surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."surveys" TO "service_role";



GRANT ALL ON TABLE "public"."user_supervisors" TO "anon";
GRANT ALL ON TABLE "public"."user_supervisors" TO "authenticated";
GRANT ALL ON TABLE "public"."user_supervisors" TO "service_role";



GRANT ALL ON TABLE "public"."managers_needing_improvement" TO "anon";
GRANT ALL ON TABLE "public"."managers_needing_improvement" TO "authenticated";
GRANT ALL ON TABLE "public"."managers_needing_improvement" TO "service_role";



GRANT ALL ON TABLE "public"."survey_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."survey_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."recent_activities" TO "anon";
GRANT ALL ON TABLE "public"."recent_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_activities" TO "service_role";



GRANT ALL ON TABLE "public"."response_trends" TO "anon";
GRANT ALL ON TABLE "public"."response_trends" TO "authenticated";
GRANT ALL ON TABLE "public"."response_trends" TO "service_role";



GRANT ALL ON TABLE "public"."silent_employees" TO "anon";
GRANT ALL ON TABLE "public"."silent_employees" TO "authenticated";
GRANT ALL ON TABLE "public"."silent_employees" TO "service_role";



GRANT ALL ON TABLE "public"."survey_overview_metrics" TO "anon";
GRANT ALL ON TABLE "public"."survey_overview_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_overview_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."survey_response_trends" TO "anon";
GRANT ALL ON TABLE "public"."survey_response_trends" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_response_trends" TO "service_role";



GRANT ALL ON TABLE "public"."top_performing_managers" TO "anon";
GRANT ALL ON TABLE "public"."top_performing_managers" TO "authenticated";
GRANT ALL ON TABLE "public"."top_performing_managers" TO "service_role";



GRANT ALL ON TABLE "public"."top_performing_sbus" TO "anon";
GRANT ALL ON TABLE "public"."top_performing_sbus" TO "authenticated";
GRANT ALL ON TABLE "public"."top_performing_sbus" TO "service_role";



GRANT ALL ON TABLE "public"."top_performing_surveys" TO "anon";
GRANT ALL ON TABLE "public"."top_performing_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."top_performing_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."upcoming_survey_deadlines" TO "anon";
GRANT ALL ON TABLE "public"."upcoming_survey_deadlines" TO "authenticated";
GRANT ALL ON TABLE "public"."upcoming_survey_deadlines" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
