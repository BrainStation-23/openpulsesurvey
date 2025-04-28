

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


CREATE TYPE "public"."approval_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'requested_changes'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


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


CREATE TYPE "public"."check_in_status" AS ENUM (
    'on_track',
    'at_risk',
    'behind'
);


ALTER TYPE "public"."check_in_status" OWNER TO "postgres";


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


CREATE TYPE "public"."kr_status" AS ENUM (
    'not_started',
    'in_progress',
    'at_risk',
    'on_track',
    'completed',
    'abandoned'
);


ALTER TYPE "public"."kr_status" OWNER TO "postgres";


CREATE TYPE "public"."level_status" AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE "public"."level_status" OWNER TO "postgres";


CREATE TYPE "public"."objective_status" AS ENUM (
    'draft',
    'in_progress',
    'at_risk',
    'on_track',
    'completed'
);


ALTER TYPE "public"."objective_status" OWNER TO "postgres";


CREATE TYPE "public"."okr_cycle_status" AS ENUM (
    'active',
    'upcoming',
    'completed',
    'archived'
);


ALTER TYPE "public"."okr_cycle_status" OWNER TO "postgres";


CREATE TYPE "public"."okr_visibility" AS ENUM (
    'private',
    'team',
    'department',
    'organization'
);


ALTER TYPE "public"."okr_visibility" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."analyze_okr_progress_logs"("p_objective_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 100) RETURNS TABLE("event_time" timestamp with time zone, "entity_id" "uuid", "entity_type" "text", "change_type" "text", "details" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.changed_at AS event_time,
    h.entity_id,
    h.entity_type,
    h.change_type,
    COALESCE(h.new_data, h.previous_data) AS details
  FROM okr_history h
  WHERE (p_objective_id IS NULL OR h.entity_id = p_objective_id)
  AND (h.entity_type LIKE '%objective%' OR h.entity_type LIKE '%key_result%')
  ORDER BY h.changed_at DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."analyze_okr_progress_logs"("p_objective_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_cascaded_objective_progress"("objective_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_weight NUMERIC := 0;
    weighted_progress NUMERIC := 0;
    kr_count INT := 0;
    alignment_count INT := 0;
    child_objective_record RECORD;
    key_result_record RECORD;
    alignment_record RECORD;
    is_locked BOOLEAN;
    v_calculation_method TEXT;
BEGIN
    -- Check if this objective is already being processed (to prevent infinite loops)
    SELECT locked INTO is_locked FROM okr_progress_calculation_lock 
    WHERE okr_progress_calculation_lock.objective_id = calculate_cascaded_objective_progress.objective_id
    FOR UPDATE;
    
    IF is_locked THEN
        -- Skip if already being processed
        RAISE NOTICE 'Objective % is locked for progress calculation', calculate_cascaded_objective_progress.objective_id;
        RETURN;
    END IF;
    
    -- Try to get a lock or create the lock record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO okr_progress_calculation_lock (objective_id, locked)
        VALUES (calculate_cascaded_objective_progress.objective_id, TRUE);
    ELSE
        UPDATE okr_progress_calculation_lock SET locked = TRUE
        WHERE okr_progress_calculation_lock.objective_id = calculate_cascaded_objective_progress.objective_id;
    END IF;

    -- Get calculation method
    SELECT COALESCE(progress_calculation_method, 'weighted_sum') INTO v_calculation_method 
    FROM objectives 
    WHERE id = calculate_cascaded_objective_progress.objective_id;
    
    -- Get weight and progress from key results
    FOR key_result_record IN 
        SELECT weight, progress 
        FROM key_results 
        WHERE key_results.objective_id = calculate_cascaded_objective_progress.objective_id
    LOOP
        -- Normalize progress to 0-1 range (it's stored as 0-100 in the DB)
        weighted_progress := weighted_progress + ((key_result_record.progress / 100) * key_result_record.weight);
        total_weight := total_weight + key_result_record.weight;
        kr_count := kr_count + 1;
    END LOOP;
    
    -- Get weight and progress from child objectives (via alignments)
    FOR alignment_record IN 
        SELECT a.weight, o.progress
        FROM okr_alignments a
        JOIN objectives o ON a.aligned_objective_id = o.id
        WHERE a.source_objective_id = calculate_cascaded_objective_progress.objective_id
        AND a.alignment_type = 'parent_child'
    LOOP
        -- Normalize progress to 0-1 range (it's stored as 0-100 in the DB)
        weighted_progress := weighted_progress + ((alignment_record.progress / 100) * alignment_record.weight);
        total_weight := total_weight + alignment_record.weight;
        alignment_count := alignment_count + 1;
    END LOOP;
    
    -- Update the objective's progress based on the calculation method
    IF total_weight > 0 THEN
        -- Convert back to 0-100 range for storage
        IF v_calculation_method = 'weighted_sum' THEN
            -- For weighted sum, we just use the sum of weighted progress values
            weighted_progress := weighted_progress * 100;
        ELSE -- 'weighted_avg'
            -- For weighted average, calculate the average - if all items are at 100%, result should be 100%
            -- regardless of weights (as long as all weights are positive)
            IF kr_count + alignment_count > 0 THEN
                -- Calculate weighted average properly
                IF kr_count > 0 AND alignment_count = 0 THEN
                    -- If we only have key results, calculate their average
                    SELECT AVG(progress) INTO weighted_progress
                    FROM key_results
                    WHERE key_results.objective_id = calculate_cascaded_objective_progress.objective_id;
                ELSIF kr_count = 0 AND alignment_count > 0 THEN
                    -- If we only have child objectives, calculate their average
                    SELECT AVG(o.progress) INTO weighted_progress
                    FROM okr_alignments a
                    JOIN objectives o ON a.aligned_objective_id = o.id
                    WHERE a.source_objective_id = calculate_cascaded_objective_progress.objective_id
                    AND a.alignment_type = 'parent_child';
                ELSE
                    -- If we have both key results and child objectives, calculate their combined average
                    -- This is a special case that needs custom handling
                    SELECT (
                        (SELECT COALESCE(AVG(progress), 0) FROM key_results 
                         WHERE key_results.objective_id = calculate_cascaded_objective_progress.objective_id) * kr_count +
                        (SELECT COALESCE(AVG(o.progress), 0) FROM okr_alignments a
                         JOIN objectives o ON a.aligned_objective_id = o.id
                         WHERE a.source_objective_id = calculate_cascaded_objective_progress.objective_id
                         AND a.alignment_type = 'parent_child') * alignment_count
                    ) / (kr_count + alignment_count) INTO weighted_progress;
                END IF;
            ELSE
                weighted_progress := 0;
            END IF;
        END IF;
    ELSE
        weighted_progress := 0;
    END IF;
    
    -- Update the objective's progress
    UPDATE objectives
    SET 
        progress = LEAST(100, weighted_progress),
        -- Auto-update status based on progress
        status = CASE 
            WHEN weighted_progress >= 100 THEN 'completed'::objective_status
            WHEN status = 'draft' AND weighted_progress > 0 THEN 'in_progress'::objective_status
            ELSE status
        END
    WHERE id = calculate_cascaded_objective_progress.objective_id;
    
    -- Release the lock
    UPDATE okr_progress_calculation_lock 
    SET locked = FALSE
    WHERE okr_progress_calculation_lock.objective_id = calculate_cascaded_objective_progress.objective_id;
    
    -- Log the calculation
    BEGIN
        INSERT INTO okr_history (
            entity_id, 
            entity_type,
            change_type,
            changed_by,
            new_data
        ) VALUES (
            calculate_cascaded_objective_progress.objective_id,
            'objective',
            'progress_calculation',
            COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
            jsonb_build_object(
                'method', v_calculation_method,
                'total_weight', total_weight,
                'weighted_progress', weighted_progress,
                'kr_count', kr_count,
                'alignment_count', alignment_count
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Ignore logging errors
        NULL;
    END;
    
    -- Finally, propagate the progress update to parent objectives
    FOR child_objective_record IN
        SELECT source_objective_id
        FROM okr_alignments
        WHERE aligned_objective_id = calculate_cascaded_objective_progress.objective_id
        AND alignment_type = 'parent_child'
    LOOP
        -- Recursively update parent objectives
        PERFORM calculate_cascaded_objective_progress(child_objective_record.source_objective_id);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."calculate_cascaded_objective_progress"("objective_id" "uuid") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."calculate_key_result_progress"("p_measurement_type" "text", "p_current_value" numeric, "p_start_value" numeric, "p_target_value" numeric, "p_boolean_value" boolean) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_progress numeric;
BEGIN
    -- Calculate progress based on measurement type
    CASE p_measurement_type
        WHEN 'boolean' THEN
            v_progress := CASE WHEN p_boolean_value THEN 100 ELSE 0 END;
        ELSE
            -- For numeric types, calculate percentage of progress
            IF p_target_value = p_start_value THEN
                v_progress := CASE WHEN p_current_value >= p_target_value THEN 100 ELSE 0 END;
            ELSE
                v_progress := ((p_current_value - p_start_value) / (p_target_value - p_start_value)) * 100;
                -- Ensure progress is between 0-100
                v_progress := GREATEST(0, LEAST(100, v_progress));
            END IF;
    END CASE;
    
    RETURN v_progress;
END;
$$;


ALTER FUNCTION "public"."calculate_key_result_progress"("p_measurement_type" "text", "p_current_value" numeric, "p_start_value" numeric, "p_target_value" numeric, "p_boolean_value" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_objective_progress_for_single_objective"("objective_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_total_weight NUMERIC := 0;
    v_weighted_progress NUMERIC := 0;
    v_error_message TEXT;
    v_old_progress NUMERIC;
BEGIN
    -- Get current objective progress for logging
    SELECT progress INTO v_old_progress
    FROM objectives
    WHERE id = objective_id;
    
    -- Log the operation for debugging
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        objective_id,
        'objective_progress_update',
        'progress_calculation_started',
        auth.uid(),
        jsonb_build_object(
            'old_objective_progress', v_old_progress,
            'calculation_type', 'single_objective'
        )
    );
    
    BEGIN
        -- Calculate the total weight and weighted progress sum
        -- Fix the ambiguous column reference by specifying the table name
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight), 0)
        INTO
            v_total_weight,
            v_weighted_progress
        FROM
            key_results kr
        WHERE
            kr.objective_id = calculate_objective_progress_for_single_objective.objective_id;
        
        -- Update the objective progress
        IF v_total_weight = 0 THEN
            UPDATE objectives
            SET progress = 0
            WHERE id = objective_id;
            
            -- Log the update
            INSERT INTO okr_history (
                entity_id,
                entity_type,
                change_type,
                changed_by,
                new_data
            ) VALUES (
                objective_id,
                'objective_progress_update',
                'progress_updated_zero_weight',
                auth.uid(),
                jsonb_build_object(
                    'new_progress', 0,
                    'total_weight', v_total_weight
                )
            );
        ELSE
            -- Calculate weighted average and round to 2 decimal places
            DECLARE
                v_new_progress NUMERIC := ROUND((v_weighted_progress / v_total_weight)::NUMERIC, 2);
            BEGIN
                UPDATE objectives
                SET 
                    progress = v_new_progress,
                    updated_at = NOW()
                WHERE id = objective_id;
                
                -- Log the update
                INSERT INTO okr_history (
                    entity_id,
                    entity_type,
                    change_type,
                    changed_by,
                    new_data
                ) VALUES (
                    objective_id,
                    'objective_progress_update',
                    'progress_updated_success',
                    auth.uid(),
                    jsonb_build_object(
                        'old_progress', v_old_progress,
                        'new_progress', v_new_progress,
                        'total_weight', v_total_weight,
                        'weighted_progress', v_weighted_progress
                    )
                );
            END;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log any errors
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        
        INSERT INTO okr_history (
            entity_id,
            entity_type,
            change_type,
            changed_by,
            previous_data
        ) VALUES (
            objective_id,
            'objective_progress_error',
            'calculation_error',
            auth.uid(),
            jsonb_build_object(
                'error', v_error_message,
                'calculation_type', 'single_objective'
            )
        );
        
        -- Continue without failing
        RAISE WARNING 'Error calculating objective progress for objective %: %', objective_id, v_error_message;
    END;
END;
$$;


ALTER FUNCTION "public"."calculate_objective_progress_for_single_objective"("objective_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_progress"("p_measurement_type" "text", "p_current_value" double precision, "p_start_value" double precision, "p_target_value" double precision, "p_boolean_value" boolean) RETURNS double precision
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."calculate_progress"("p_measurement_type" "text", "p_current_value" double precision, "p_start_value" double precision, "p_target_value" double precision, "p_boolean_value" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user's role is in any of the alignment permission arrays
  -- or if the arrays are empty (which means anyone can create)
  SELECT 
    (
      -- Either the array is empty (allows all)
      array_length(can_create_alignments, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_alignments) OR
      array_length(can_align_with_org_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_align_with_org_objectives) OR
      array_length(can_align_with_dept_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_align_with_dept_objectives) OR
      array_length(can_align_with_team_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_align_with_team_objectives)
    )
  INTO v_can_create
  FROM okr_role_settings
  LIMIT 1;
  
  RETURN COALESCE(v_can_create, FALSE);
END;
$$;


ALTER FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") IS 'Checks if a user has permission to create any type of alignment';



CREATE OR REPLACE FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
  v_permission_array UUID[];
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the appropriate permission array based on visibility
  SELECT
    CASE 
      WHEN p_visibility = 'organization' THEN can_align_with_org_objectives
      WHEN p_visibility = 'department' THEN can_align_with_dept_objectives
      WHEN p_visibility = 'team' THEN can_align_with_team_objectives
      ELSE can_create_alignments
    END
  INTO v_permission_array
  FROM okr_role_settings
  LIMIT 1;
  
  -- Check if the permission array is empty (anyone can create) or if the user's role is in it
  RETURN array_length(v_permission_array, 1) IS NULL OR v_employee_role_id = ANY(v_permission_array);
END;
$$;


ALTER FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") IS 'Checks if a user has permission to create alignments with objectives of a specific visibility';



CREATE OR REPLACE FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user's role is in the key results permission array
  -- or if the array is empty (which means anyone can create)
  SELECT 
    (
      array_length(can_create_key_results, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_key_results)
    )
  INTO v_can_create
  FROM okr_role_settings
  LIMIT 1;
  
  RETURN COALESCE(v_can_create, FALSE);
END;
$$;


ALTER FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") IS 'Checks if a user has permission to create key results';



CREATE OR REPLACE FUNCTION "public"."can_create_objective"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user's role is in any of the permission arrays
  -- or if the arrays are empty (which means anyone can create)
  SELECT 
    (
      -- Either the array is empty (allows all)
      array_length(can_create_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_objectives) OR
      array_length(can_create_org_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_org_objectives) OR
      array_length(can_create_dept_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_dept_objectives) OR
      array_length(can_create_team_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_team_objectives)
    )
  INTO v_can_create
  FROM okr_role_settings
  LIMIT 1;
  
  RETURN COALESCE(v_can_create, FALSE);
END;
$$;


ALTER FUNCTION "public"."can_create_objective"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_objective"("p_user_id" "uuid") IS 'Checks if a user has permission to create any type of objective';



CREATE OR REPLACE FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_can_create_general BOOLEAN;
  v_source_visibility TEXT;
  v_aligned_visibility TEXT;
  v_can_align_with_source BOOLEAN;
  v_can_align_with_aligned BOOLEAN;
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has general alignment creation permission
  SELECT can_create_alignment(p_user_id) INTO v_can_create_general;
  
  IF NOT v_can_create_general THEN
    RETURN FALSE;
  END IF;
  
  -- Get visibility of both objectives
  SELECT visibility INTO v_source_visibility
  FROM objectives
  WHERE id = p_source_objective_id;
  
  SELECT visibility INTO v_aligned_visibility
  FROM objectives
  WHERE id = p_aligned_objective_id;
  
  -- Check permission for each objective's visibility level
  SELECT can_create_alignment_by_visibility(p_user_id, v_source_visibility) INTO v_can_align_with_source;
  SELECT can_create_alignment_by_visibility(p_user_id, v_aligned_visibility) INTO v_can_align_with_aligned;
  
  -- User needs permission for both objectives
  RETURN v_can_align_with_source AND v_can_align_with_aligned;
END;
$$;


ALTER FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") IS 'Checks if a user has permission to create an alignment between two specific objectives';



CREATE OR REPLACE FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
  v_permission_array UUID[];
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the appropriate permission array based on visibility
  SELECT
    CASE 
      WHEN p_visibility = 'organization' THEN can_create_org_objectives
      WHEN p_visibility = 'department' THEN can_create_dept_objectives
      WHEN p_visibility = 'team' THEN can_create_team_objectives
      ELSE can_create_objectives
    END
  INTO v_permission_array
  FROM okr_role_settings
  LIMIT 1;
  
  -- Check if the permission array is empty (anyone can create) or if the user's role is in it
  RETURN array_length(v_permission_array, 1) IS NULL OR v_employee_role_id = ANY(v_permission_array);
END;
$$;


ALTER FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") IS 'Checks if a user has permission to create objectives with a specific visibility';



CREATE OR REPLACE FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


CREATE OR REPLACE FUNCTION "public"."check_objective_owner_permission"("p_user_id" "uuid", "p_objective_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_owner BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is the owner of the objective
  SELECT EXISTS (
    SELECT 1 
    FROM objectives 
    WHERE id = p_objective_id 
    AND owner_id = p_user_id
  ) INTO v_is_owner;
  
  RETURN v_is_owner;
END;
$$;


ALTER FUNCTION "public"."check_objective_owner_permission"("p_user_id" "uuid", "p_objective_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_permission_array UUID[];
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the appropriate permission array based on permission type and visibility
  CASE 
    WHEN p_permission_type = 'create_objectives' AND p_visibility IS NULL THEN
      SELECT can_create_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'organization' THEN
      SELECT can_create_org_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'department' THEN
      SELECT can_create_dept_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'team' THEN
      SELECT can_create_team_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_key_results' THEN
      SELECT can_create_key_results INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility IS NULL THEN
      SELECT can_create_alignments INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'organization' THEN
      SELECT can_align_with_org_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'department' THEN
      SELECT can_align_with_dept_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'team' THEN
      SELECT can_align_with_team_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check if the user's role is in the permission array
  -- Empty array means no restrictions (all roles have permission)
  RETURN array_length(v_permission_array, 1) IS NULL OR v_employee_role_id = ANY(v_permission_array);
END;
$$;


ALTER FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text") IS 'Checks if a user has permission to perform specific OKR actions based on employee role';



CREATE OR REPLACE FUNCTION "public"."check_okr_objective_access"("p_user_id" "uuid", "p_objective_id" "uuid", "p_access_type" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_profile RECORD;
    v_has_access BOOLEAN;
BEGIN
    -- Get user profile information with admin status
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

    -- Check if user is the owner of the objective
    SELECT EXISTS (
        SELECT 1 FROM objectives o
        WHERE o.id = p_objective_id
        AND o.owner_id = p_user_id
    ) INTO v_has_access;
    
    IF v_has_access THEN
        RETURN TRUE;
    END IF;

    -- Check if user has explicit permission via okr_permissions
    SELECT EXISTS (
        SELECT 1
        FROM okr_permissions op
        WHERE op.objective_id = p_objective_id
        AND (
            -- User directly listed in user_ids
            (p_user_id = ANY(op.user_ids))
            OR
            -- User's SBU listed in sbu_ids
            (EXISTS (
                SELECT 1 FROM user_sbus us 
                WHERE us.user_id = p_user_id 
                AND us.sbu_id = ANY(op.sbu_ids)
            ))
            OR
            -- User's role listed in employee_role_ids
            (v_profile.employee_role_id = ANY(op.employee_role_ids))
        )
        AND (
            (p_access_type = 'view' AND op.can_view = TRUE) OR
            (p_access_type = 'edit' AND op.can_edit = TRUE) OR
            (p_access_type = 'comment' AND op.can_comment = TRUE)
        )
    ) INTO v_has_access;

    RETURN v_has_access;
END;
$$;


ALTER FUNCTION "public"."check_okr_objective_access"("p_user_id" "uuid", "p_objective_id" "uuid", "p_access_type" "text") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_campaign RECORD;
    v_last_instance RECORD;
    v_next_period INTEGER;
    v_next_start TIMESTAMPTZ;
    v_next_end TIMESTAMPTZ;
    v_next_instance_id UUID;
    v_frequency TEXT;
    v_duration_days INTEGER;
    v_instance_end_time TIMESTAMPTZ;
BEGIN
    -- Get campaign information
    SELECT 
        is_recurring,
        recurring_frequency,
        instance_duration_days,
        instance_end_time
    INTO v_campaign
    FROM survey_campaigns
    WHERE id = p_campaign_id;
    
    -- If campaign doesn't exist, raise an error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign with ID % not found', p_campaign_id;
    END IF;
    
    -- Get the last instance for this campaign
    SELECT 
        id,
        period_number,
        starts_at,
        ends_at
    INTO v_last_instance
    FROM campaign_instances
    WHERE campaign_id = p_campaign_id
    ORDER BY period_number DESC
    LIMIT 1;
    
    -- If no instances exist yet, raise an exception (should never happen)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existing instances found for campaign %', p_campaign_id;
    END IF;
    
    -- Calculate next period number
    v_next_period := v_last_instance.period_number + 1;
    
    -- Store campaign properties in local variables for clarity
    v_frequency := v_campaign.recurring_frequency;
    v_duration_days := COALESCE(v_campaign.instance_duration_days, 7); -- Default to 7 days if not set
    v_instance_end_time := v_campaign.instance_end_time;
    
    -- Calculate next start date based on the last instance's start date and the campaign's frequency
    CASE v_frequency
        WHEN 'daily' THEN
            v_next_start := v_last_instance.starts_at + INTERVAL '1 day';
        WHEN 'weekly' THEN
            v_next_start := v_last_instance.starts_at + INTERVAL '7 days';
        WHEN 'monthly' THEN
            -- For monthly, we add 1 month while preserving the day of month if possible
            v_next_start := (
                date_trunc('month', v_last_instance.starts_at) + INTERVAL '1 month' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day'
            )::TIMESTAMPTZ;
            
            -- If we went past the end of month, adjust to the last day of the target month
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM date_trunc('month', v_next_start)) THEN
                v_next_start := date_trunc('month', v_next_start + INTERVAL '1 month') - INTERVAL '1 day';
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        WHEN 'quarterly' THEN
            -- For quarterly, we add 3 months while preserving the day of month if possible
            v_next_start := (
                date_trunc('month', v_last_instance.starts_at) + INTERVAL '3 month' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day'
            )::TIMESTAMPTZ;
            
            -- If we went past the end of month, adjust to the last day of the target month
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM date_trunc('month', v_next_start)) THEN
                v_next_start := date_trunc('month', v_next_start + INTERVAL '1 month') - INTERVAL '1 day';
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        WHEN 'yearly' THEN
            -- For yearly, we add 1 year while preserving the month and day if possible
            v_next_start := (
                date_trunc('year', v_last_instance.starts_at) + INTERVAL '1 year' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day' +
                (EXTRACT(MONTH FROM v_last_instance.starts_at) - 1) * INTERVAL '1 month'
            )::TIMESTAMPTZ;
            
            -- Check if we landed on a valid day (for Feb 29 in leap years)
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM v_last_instance.starts_at) THEN
                -- Adjust to the last day of the target month
                v_next_start := (
                    date_trunc('month', (
                        date_trunc('year', v_last_instance.starts_at) + INTERVAL '1 year' +
                        (EXTRACT(MONTH FROM v_last_instance.starts_at) - 1) * INTERVAL '1 month'
                    )) + INTERVAL '1 month' - INTERVAL '1 day'
                )::TIMESTAMPTZ;
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        ELSE
            -- For custom or unrecognized frequency, default to adding the duration days
            v_next_start := v_last_instance.starts_at + (v_duration_days * INTERVAL '1 day');
    END CASE;
    
    -- Calculate end date based on duration and end time
    IF v_instance_end_time IS NOT NULL THEN
        -- Use the instance end time but on the end date calculated from duration
        v_next_end := date_trunc('day', v_next_start + (v_duration_days * INTERVAL '1 day')) +
                      EXTRACT(HOUR FROM v_instance_end_time) * INTERVAL '1 hour' +
                      EXTRACT(MINUTE FROM v_instance_end_time) * INTERVAL '1 minute' +
                      EXTRACT(SECOND FROM v_instance_end_time) * INTERVAL '1 second';
    ELSE
        -- If no specific end time, just add the duration days to the start date
        v_next_end := v_next_start + (v_duration_days * INTERVAL '1 day');
    END IF;
    
    -- Insert the new instance
    INSERT INTO campaign_instances (
        campaign_id,
        period_number,
        starts_at,
        ends_at,
        status
    ) VALUES (
        p_campaign_id,
        v_next_period,
        v_next_start,
        v_next_end,
        CASE 
            WHEN v_next_start <= NOW() AND v_next_end > NOW() THEN 'active'::instance_status
            WHEN v_next_start > NOW() THEN 'upcoming'::instance_status
            ELSE 'completed'::instance_status
        END
    ) RETURNING id INTO v_next_instance_id;
    
    -- Return the ID of the newly created instance
    RETURN v_next_instance_id;
END;
$$;


ALTER FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") IS 'Creates the next campaign instance based on the last instance, considering the campaign frequency and duration settings';



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


CREATE OR REPLACE FUNCTION "public"."drop_and_recreate_question_responses_function"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."drop_and_recreate_question_responses_function"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_start_date_max" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date_min" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date_max" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_status" "text"[] DEFAULT NULL::"text"[], "p_sort_by" "text" DEFAULT 'period_number'::"text", "p_sort_direction" "text" DEFAULT 'asc'::"text", "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "period_number" integer, "starts_at" timestamp with time zone, "ends_at" timestamp with time zone, "status" "text", "completion_rate" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  v_offset INTEGER := (p_page - 1) * p_page_size;
  v_sort_sql TEXT;
  v_status_filter TEXT;
BEGIN
  -- Validate sort_by parameter
  IF p_sort_by NOT IN ('period_number', 'starts_at', 'ends_at', 'status', 'completion_rate', 'created_at', 'updated_at') THEN
    RAISE EXCEPTION 'Invalid sort_by parameter: %', p_sort_by;
  END IF;

  -- Validate sort_direction parameter
  IF p_sort_direction NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'Invalid sort_direction parameter: %', p_sort_direction;
  END IF;

  -- Convert status array to string for filtering if provided
  IF p_status IS NOT NULL AND array_length(p_status, 1) > 0 THEN
    v_status_filter := ' AND status::TEXT = ANY($7)';
  ELSE
    v_status_filter := '';
  END IF;

  -- Construct the basic query
  RETURN QUERY EXECUTE 
  'SELECT 
    ci.id,
    ci.campaign_id,
    ci.period_number,
    ci.starts_at,
    ci.ends_at,
    ci.status::TEXT,
    ci.completion_rate,
    ci.created_at,
    ci.updated_at,
    COUNT(*) OVER() AS total_count
  FROM campaign_instances ci
  WHERE ci.campaign_id = $1
    AND ($2 IS NULL OR ci.starts_at >= $2)
    AND ($3 IS NULL OR ci.starts_at <= $3)
    AND ($4 IS NULL OR ci.ends_at >= $4)
    AND ($5 IS NULL OR ci.ends_at <= $5)'
    || v_status_filter ||
  ' ORDER BY ' || p_sort_by || ' ' || p_sort_direction || '
  LIMIT $8
  OFFSET $9'
  USING 
    p_campaign_id, 
    p_start_date_min, 
    p_start_date_max, 
    p_end_date_min, 
    p_end_date_max, 
    p_page_size, 
    p_status, 
    p_page_size, 
    v_offset;
END;
$_$;


ALTER FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone, "p_start_date_max" timestamp with time zone, "p_end_date_min" timestamp with time zone, "p_end_date_max" timestamp with time zone, "p_status" "text"[], "p_sort_by" "text", "p_sort_direction" "text", "p_page" integer, "p_page_size" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone, "p_start_date_max" timestamp with time zone, "p_end_date_min" timestamp with time zone, "p_end_date_max" timestamp with time zone, "p_status" "text"[], "p_sort_by" "text", "p_sort_direction" "text", "p_page" integer, "p_page_size" integer) IS 'Returns paginated and filtered campaign instances with sorting options';



CREATE OR REPLACE FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("rank" integer, "sbu_name" "text", "total_assigned" integer, "total_completed" integer, "avg_score" double precision, "completion_rate" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  WITH 
  -- Get all assignments for the campaign
  assignments AS (
    SELECT 
      sa.id AS assignment_id,
      sa.user_id,
      us.sbu_id,
      s.name AS sbu_name,
      CASE WHEN sr.id IS NOT NULL AND sr.status = 'submitted' THEN 1 ELSE 0 END AS is_completed
    FROM survey_assignments sa
    JOIN user_sbus us ON us.user_id = sa.user_id AND us.is_primary = true
    JOIN sbus s ON s.id = us.sbu_id
    LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
                                 AND sr.campaign_instance_id = p_instance_id
                                 AND sr.status = 'submitted'
    WHERE sa.campaign_id = p_campaign_id
  ),
  -- Extract rating values and compute average per SBU
  -- Specifically for 1-5 scale rating questions
  ratings AS (
    SELECT 
      us.sbu_id,
      AVG(r.value::FLOAT) AS avg_rating
    FROM survey_responses sr
    -- Re-join these tables within the ratings CTE
    JOIN survey_assignments sa_inner ON sr.assignment_id = sa_inner.id
    JOIN user_sbus us ON us.user_id = sa_inner.user_id AND us.is_primary = true
    -- Join with surveys to get question types
    JOIN survey_campaigns sc ON sc.id = p_campaign_id
    JOIN surveys s ON s.id = sc.survey_id,
    LATERAL jsonb_each_text(sr.response_data) AS r(key, value),
    LATERAL jsonb_array_elements(s.json_data->'pages') AS page,
    LATERAL jsonb_array_elements(page->'elements') AS question
    WHERE sr.campaign_instance_id = p_instance_id
      AND sr.status = 'submitted'
      AND r.value ~ '^\d+(\.\d+)?$'  -- Ensure the value is numeric
      AND question->>'type' = 'rating'  -- Ensure it's a rating question
      AND (
        (question->>'rateMax' IS NULL) OR  -- Default 1-5 scale when not specified
        (question->>'rateMax' = '5')       -- Explicitly 1-5 scale
      )
      AND r.key = question->>'name'        -- Match response key to question name
      AND r.value::FLOAT BETWEEN 1 AND 5     -- Additional validation for range
    GROUP BY us.sbu_id
  ),
  -- Aggregate stats by SBU
  sbu_stats AS (
    SELECT 
      a.sbu_id,
      a.sbu_name,
      COUNT(DISTINCT a.assignment_id) AS total_assigned,
      SUM(a.is_completed)::INTEGER AS total_completed,
      COALESCE(r.avg_rating, 0) AS avg_score,
      CASE 
        WHEN COUNT(DISTINCT a.assignment_id) > 0 
        THEN (SUM(a.is_completed)::FLOAT / COUNT(DISTINCT a.assignment_id)::FLOAT) * 100
        ELSE 0
      END AS completion_rate
    FROM assignments a
    LEFT JOIN ratings r ON r.sbu_id = a.sbu_id
    GROUP BY a.sbu_id, a.sbu_name, r.avg_rating
  )
  -- Rank SBUs by average score
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ss.avg_score DESC)::INTEGER AS rank,
    ss.sbu_name,
    ss.total_assigned::INTEGER,
    ss.total_completed::INTEGER,
    ss.avg_score,
    ss.completion_rate
  FROM sbu_stats ss
  WHERE ss.total_assigned > 0
  ORDER BY ss.avg_score DESC, ss.total_completed DESC;
END;
$_$;


ALTER FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") IS 'Returns performance metrics for top SBUs in a campaign instance, ranked by average rating score.';



CREATE OR REPLACE FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("rank" integer, "supervisor_name" "text", "sbu_name" "text", "total_assigned" integer, "total_completed" integer, "avg_score" double precision, "completion_rate" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  WITH 
  -- Get all assignments for the campaign with supervisor information
  assignments AS (
    SELECT 
      sa.id AS assignment_id,
      sa.user_id,
      usup.supervisor_id,
      CONCAT(sup.first_name, ' ', sup.last_name) AS supervisor_name,
      us.sbu_id,
      s.name AS sbu_name,
      CASE WHEN sr.id IS NOT NULL AND sr.status = 'submitted' THEN 1 ELSE 0 END AS is_completed
    FROM survey_assignments sa
    -- Join to get the user's primary supervisor
    JOIN user_supervisors usup ON usup.user_id = sa.user_id AND usup.is_primary = true
    JOIN profiles sup ON sup.id = usup.supervisor_id
    -- Join to get the user's primary SBU
    JOIN user_sbus us ON us.user_id = sa.user_id AND us.is_primary = true
    JOIN sbus s ON s.id = us.sbu_id
    -- Join to check if there's a submitted response
    LEFT JOIN survey_responses sr ON sr.assignment_id = sa.id 
                                 AND sr.campaign_instance_id = p_instance_id
                                 AND sr.status = 'submitted'
    WHERE sa.campaign_id = p_campaign_id
  ),
  -- Extract rating values and compute average per supervisor
  ratings AS (
    SELECT 
      usup.supervisor_id,
      AVG(r.value::FLOAT) AS avg_rating
    FROM survey_responses sr
    -- Re-join these tables within the ratings CTE
    JOIN survey_assignments sa_inner ON sr.assignment_id = sa_inner.id
    JOIN user_supervisors usup ON usup.user_id = sa_inner.user_id AND usup.is_primary = true
    -- Join with surveys to get question types
    JOIN survey_campaigns sc ON sc.id = p_campaign_id
    JOIN surveys s ON s.id = sc.survey_id,
    LATERAL jsonb_each_text(sr.response_data) AS r(key, value),
    LATERAL jsonb_array_elements(s.json_data->'pages') AS page,
    LATERAL jsonb_array_elements(page->'elements') AS question
    WHERE sr.campaign_instance_id = p_instance_id
      AND sr.status = 'submitted'
      AND r.value ~ '^\d+(\.\d+)?$'  -- Ensure the value is numeric
      AND question->>'type' = 'rating'  -- Ensure it's a rating question
      AND (
        (question->>'rateMax' IS NULL) OR  -- Default 1-5 scale when not specified
        (question->>'rateMax' = '5')       -- Explicitly 1-5 scale
      )
      AND r.key = question->>'name'        -- Match response key to question name
      AND r.value::FLOAT BETWEEN 1 AND 5   -- Additional validation for range
    GROUP BY usup.supervisor_id
  ),
  -- Get supervisor's primary SBU
  supervisor_sbu AS (
    SELECT
      p.id AS supervisor_id,
      s.name AS supervisor_sbu_name
    FROM profiles p
    JOIN user_sbus us ON us.user_id = p.id AND us.is_primary = true
    JOIN sbus s ON s.id = us.sbu_id
  ),
  -- Aggregate stats by supervisor
  supervisor_stats AS (
    SELECT 
      a.supervisor_id,
      MAX(a.supervisor_name) AS supervisor_name,
      COALESCE(ss.supervisor_sbu_name, 'Unknown SBU') AS sbu_name,
      COUNT(DISTINCT a.assignment_id) AS total_assigned,
      SUM(a.is_completed)::INTEGER AS total_completed,
      COALESCE(r.avg_rating, 0) AS avg_score,
      CASE 
        WHEN COUNT(DISTINCT a.assignment_id) > 0 
        THEN (SUM(a.is_completed)::FLOAT / COUNT(DISTINCT a.assignment_id)::FLOAT) * 100
        ELSE 0
      END AS completion_rate
    FROM assignments a
    LEFT JOIN ratings r ON r.supervisor_id = a.supervisor_id
    LEFT JOIN supervisor_sbu ss ON ss.supervisor_id = a.supervisor_id
    GROUP BY a.supervisor_id, ss.supervisor_sbu_name, r.avg_rating
  )
  -- Rank supervisors by average score
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ss.avg_score DESC)::INTEGER AS rank,
    ss.supervisor_name,
    ss.sbu_name,
    ss.total_assigned::INTEGER,
    ss.total_completed::INTEGER,
    ss.avg_score,
    ss.completion_rate
  FROM supervisor_stats ss
  WHERE ss.total_assigned > 4;
END;
$_$;


ALTER FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") IS 'Returns performance metrics for top supervisors in a campaign instance, ranked by average rating score';



CREATE OR REPLACE FUNCTION "public"."get_dimension_bool"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") RETURNS TABLE("dimension" "text", "yes_count" bigint, "no_count" bigint, "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH response_stats AS (
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
            WHEN p.gender IS NULL THEN 'Not Specified'
            ELSE p.gender::text
          END
        ELSE 'Unknown'
      END AS dimension_value,
      CASE 
        WHEN LOWER(sr.response_data->>p_question_name) IN ('true', '1', 'yes') THEN true
        ELSE false
      END AS bool_value
    FROM survey_responses sr
    JOIN survey_assignments sa ON sr.assignment_id = sa.id
    JOIN profiles p ON p.id = sa.user_id
    LEFT JOIN user_supervisors us ON us.user_id = p.id AND us.is_primary = TRUE
    LEFT JOIN profiles sup ON sup.id = us.supervisor_id
    LEFT JOIN user_sbus usbu ON usbu.user_id = p.id AND usbu.is_primary = TRUE
    LEFT JOIN sbus s ON s.id = usbu.sbu_id
    LEFT JOIN locations loc ON loc.id = p.location_id
    LEFT JOIN employment_types et ON et.id = p.employment_type_id
    LEFT JOIN employee_types ety ON ety.id = p.employee_type_id
    LEFT JOIN employee_roles er ON er.id = p.employee_role_id
    LEFT JOIN levels l ON l.id = p.level_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    AND sr.response_data ? p_question_name
  )
  SELECT
    rs.dimension_value AS dimension,
    SUM(CASE WHEN rs.bool_value THEN 1 ELSE 0 END) AS yes_count,
    SUM(CASE WHEN NOT rs.bool_value THEN 1 ELSE 0 END) AS no_count,
    COUNT(*) AS total_count
  FROM response_stats rs
  WHERE rs.dimension_value IS NOT NULL
  GROUP BY rs.dimension_value
  HAVING 
    -- Only apply minimum response count for supervisor dimension
    CASE 
      WHEN p_dimension = 'supervisor' THEN COUNT(*) >= 4
      ELSE true
    END
  ORDER BY yes_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_dimension_bool"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dimension_nps"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") RETURNS TABLE("dimension" "text", "detractors" bigint, "passives" bigint, "promoters" bigint, "total" bigint, "nps_score" numeric, "avg_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  WITH response_stats AS (
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
            WHEN p.gender IS NULL THEN 'Not Specified'
            ELSE p.gender::text
          END
        ELSE 'Unknown'
      END AS dimension_value,
      (sr.response_data->>p_question_name)::NUMERIC AS rating_value
    FROM survey_responses sr
    JOIN survey_assignments sa ON sa.id = sr.assignment_id
    JOIN profiles p ON p.id = sa.user_id
    LEFT JOIN user_supervisors us ON us.user_id = p.id AND us.is_primary = TRUE
    LEFT JOIN profiles sup ON sup.id = us.supervisor_id
    LEFT JOIN user_sbus usbu ON usbu.user_id = p.id AND usbu.is_primary = TRUE
    LEFT JOIN sbus s ON s.id = usbu.sbu_id
    LEFT JOIN locations loc ON loc.id = p.location_id
    LEFT JOIN employment_types et ON et.id = p.employment_type_id
    LEFT JOIN employee_types ety ON ety.id = p.employee_type_id
    LEFT JOIN employee_roles er ON er.id = p.employee_role_id
    LEFT JOIN levels l ON l.id = p.level_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    AND sr.response_data->>p_question_name ~ '^[0-9]+$'
  ),
  dimension_stats AS (
    SELECT
      dimension_value,
      COUNT(*) AS total_responses,
      SUM(CASE WHEN rating_value <= 6 THEN 1 ELSE 0 END) AS detractors_count,
      SUM(CASE WHEN rating_value BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS passives_count,
      SUM(CASE WHEN rating_value >= 9 THEN 1 ELSE 0 END) AS promoters_count,
      ROUND(AVG(rating_value)::NUMERIC, 2) AS avg_rating_score,
      ROUND(
        ((SUM(CASE WHEN rating_value >= 9 THEN 1 ELSE 0 END)::NUMERIC - 
          SUM(CASE WHEN rating_value <= 6 THEN 1 ELSE 0 END)::NUMERIC) / 
         COUNT(*)::NUMERIC) * 100,
        1
      ) AS calculated_nps_score
    FROM response_stats
    WHERE dimension_value IS NOT NULL
    GROUP BY dimension_value
  )
  SELECT 
    dimension_value AS dimension,
    detractors_count AS detractors,
    passives_count AS passives,
    promoters_count AS promoters,
    total_responses AS total,
    calculated_nps_score AS nps_score,
    avg_rating_score AS avg_score
  FROM dimension_stats
  ORDER BY calculated_nps_score DESC;
END;
$_$;


ALTER FUNCTION "public"."get_dimension_nps"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dimension_satisfaction"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") RETURNS TABLE("dimension" "text", "unsatisfied" bigint, "neutral" bigint, "satisfied" bigint, "total" bigint, "avg_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$BEGIN
  RETURN QUERY
  WITH response_stats AS (
    SELECT 
      -- Dynamic dimension selection based on input parameter
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
            WHEN p.gender IS NULL THEN 'Not Specified'
            ELSE p.gender::text  -- Cast the enum to text to prevent enum validation errors
          END
        ELSE 'Unknown'
      END AS dimension_value,
      -- Get the rating value for the specific question
      (sr.response_data->>p_question_name)::NUMERIC AS rating_value
    FROM survey_responses sr
    JOIN survey_assignments sa ON sr.assignment_id = sa.id
    JOIN profiles p ON p.id = sa.user_id
    -- Join all dimension tables with LEFT JOIN to handle nulls
    LEFT JOIN user_supervisors us ON us.user_id = p.id AND us.is_primary = TRUE
    LEFT JOIN profiles sup ON sup.id = us.supervisor_id
    LEFT JOIN user_sbus usbu ON usbu.user_id = p.id AND usbu.is_primary = TRUE
    LEFT JOIN sbus s ON s.id = usbu.sbu_id
    LEFT JOIN locations loc ON loc.id = p.location_id
    LEFT JOIN employment_types et ON et.id = p.employment_type_id
    LEFT JOIN employee_types ety ON ety.id = p.employee_type_id
    LEFT JOIN employee_roles er ON er.id = p.employee_role_id
    LEFT JOIN levels l ON l.id = p.level_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR sr.campaign_instance_id = p_instance_id)
    AND sr.status = 'submitted'
    -- Ensure we have a numeric rating
    AND sr.response_data->>p_question_name ~ '^[0-9]+$'
    AND (sr.response_data->>p_question_name)::NUMERIC BETWEEN 1 AND 5
  ),
  dimension_stats AS (
    SELECT
      dimension_value,
      COUNT(*) AS total_responses,
      SUM(CASE WHEN rating_value <= 3 THEN 1 ELSE 0 END) AS unsatisfied_count,
      SUM(CASE WHEN rating_value = 4 THEN 1 ELSE 0 END) AS neutral_count,
      SUM(CASE WHEN rating_value = 5 THEN 1 ELSE 0 END) AS satisfied_count,
      ROUND(AVG(rating_value)::NUMERIC, 2) AS avg_rating_score
    FROM response_stats
    WHERE dimension_value IS NOT NULL
    GROUP BY dimension_value
    -- Only include dimensions with at least 4 responses for statistical significance
  )
  SELECT 
    dimension_value AS dimension,
    unsatisfied_count AS unsatisfied,
    neutral_count AS neutral,
    satisfied_count AS satisfied,
    total_responses AS total,
    avg_rating_score AS avg_score
  FROM dimension_stats
  ORDER BY avg_rating_score DESC;
END;$_$;


ALTER FUNCTION "public"."get_dimension_satisfaction"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") RETURNS TABLE("campaign_instance_id" "uuid", "response_count" integer, "avg_numeric_value" numeric, "yes_percentage" numeric, "question_key" "text", "text_responses" "text"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
    )
    -- Final aggregation
    SELECT
        rd.campaign_instance_id,
        COUNT(*)::INTEGER AS response_count,
        -- Handle rating questions
        CASE 
            WHEN sq.question_type = 'rating' 
            THEN AVG(
                CASE 
                    WHEN (rd.response_data->>sq.question_key) ~ '^[0-9]+(\.[0-9]+)?$'
                    THEN (rd.response_data->>sq.question_key)::NUMERIC
                    ELSE NULL
                END
            )
            ELSE NULL 
        END AS avg_numeric_value,
        -- Handle boolean questions
        CASE 
            WHEN sq.question_type = 'boolean' 
            THEN (
                SUM(
                    CASE 
                        WHEN LOWER(rd.response_data->>sq.question_key) IN ('true', '1', 'yes') THEN 1 
                        ELSE 0 
                    END
                )::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100
            )
            ELSE NULL 
        END AS yes_percentage,
        sq.question_key,
        -- Handle text responses
        CASE 
            WHEN sq.question_type IN ('text', 'comment') 
            THEN array_remove(array_agg(NULLIF(rd.response_data->>sq.question_key, '')), NULL)
            ELSE NULL 
        END AS text_responses
    FROM 
        survey_questions sq
        CROSS JOIN response_data rd
    WHERE 
        rd.response_data ? sq.question_key
    GROUP BY 
        rd.campaign_instance_id,
        sq.question_key,
        sq.question_type
    ORDER BY 
        sq.question_key;
END;
$_$;


ALTER FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") IS 'Returns processed question responses for campaign instance comparison with proper handling of different question types';



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


CREATE OR REPLACE FUNCTION "public"."get_paginated_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid" DEFAULT NULL::"uuid", "p_status" "text" DEFAULT NULL::"text", "p_search_term" "text" DEFAULT NULL::"text", "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "user_id" "uuid", "campaign_id" "uuid", "public_access_token" "uuid", "last_reminder_sent" timestamp with time zone, "status" "text", "user_details" "jsonb", "response" "jsonb", "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
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
            sa.id AS assignment_id,
            sa.user_id,
            sa.campaign_id,
            sa.public_access_token,
            sa.last_reminder_sent,
            -- Calculated status
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
                    SELECT ci.ends_at 
                    FROM campaign_instances ci
                    WHERE ci.id = p_instance_id
                ) < NOW() THEN 'expired'
                ELSE 'assigned'
            END AS status,
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
            ) AS user_details,
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
            ) AS response
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
        a.assignment_id AS id,
        a.user_id,
        a.campaign_id,
        a.public_access_token,
        a.last_reminder_sent,
        a.status,
        a.user_details,
        a.response,
        v_total_count AS total_count
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


ALTER FUNCTION "public"."get_paginated_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_status" "text", "p_search_term" "text", "p_page" integer, "p_page_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text" DEFAULT NULL::"text", "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 10, "p_sort_by" "text" DEFAULT 'date'::"text", "p_sort_direction" "text" DEFAULT 'desc'::"text") RETURNS TABLE("id" "uuid", "assignment_id" "uuid", "user_id" "uuid", "campaign_instance_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "submitted_at" timestamp with time zone, "status" "text", "response_data" "jsonb", "state_data" "jsonb", "total_count" bigint, "campaign_anonymous" boolean, "primary_sbu_name" "text", "primary_supervisor_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_offset INTEGER := (p_page - 1) * p_page_size;
  v_sort_sql TEXT;
  v_campaign_anonymous BOOLEAN;
BEGIN
  -- Get campaign anonymity setting - Fix the ambiguous reference by qualifying the id column
  SELECT sc.anonymous INTO v_campaign_anonymous
  FROM survey_campaigns sc
  WHERE sc.id = p_campaign_id;
  
  -- Set up sorting SQL
  IF p_sort_by = 'date' THEN
    v_sort_sql := 'sr.submitted_at ' || p_sort_direction;
  ELSIF p_sort_by = 'name' THEN
    v_sort_sql := 'CONCAT(p.first_name, '' '', p.last_name) ' || p_sort_direction;
  ELSE
    -- Default to date sorting
    v_sort_sql := 'sr.submitted_at ' || p_sort_direction;
  END IF;

  RETURN QUERY
  SELECT 
    sr.id,
    sr.assignment_id,
    sr.user_id,
    sr.campaign_instance_id,
    sr.created_at,
    sr.updated_at,
    sr.submitted_at,
    sr.status::TEXT, -- Cast enum to text
    sr.response_data,
    sr.state_data,
    COUNT(*) OVER() AS total_count,
    v_campaign_anonymous, -- Return campaign anonymity setting
    -- Get primary SBU name (if any)
    (
      SELECT s.name
      FROM user_sbus us
      JOIN sbus s ON s.id = us.sbu_id
      WHERE us.user_id = sr.user_id AND us.is_primary = true
      LIMIT 1
    ) AS primary_sbu_name,
    -- Get primary supervisor name (if any)
    (
      SELECT CONCAT(sup.first_name, ' ', sup.last_name)
      FROM user_supervisors usup
      JOIN profiles sup ON sup.id = usup.supervisor_id
      WHERE usup.user_id = sr.user_id AND usup.is_primary = true
      LIMIT 1
    ) AS primary_supervisor_name
  FROM survey_responses sr
  JOIN survey_assignments sa ON sr.assignment_id = sa.id
  JOIN profiles p ON p.id = sr.user_id
  WHERE sa.campaign_id = p_campaign_id
  AND sr.campaign_instance_id = p_instance_id
  AND (
    p_search_term IS NULL
    OR LOWER(p.email) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(COALESCE(p.first_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(COALESCE(p.last_name, '')) LIKE '%' || LOWER(p_search_term) || '%'
    OR LOWER(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) LIKE '%' || LOWER(p_search_term) || '%'
  )
  ORDER BY (CASE WHEN v_sort_sql = 'sr.submitted_at desc' THEN sr.submitted_at END) DESC,
           (CASE WHEN v_sort_sql = 'sr.submitted_at asc' THEN sr.submitted_at END) ASC,
           (CASE WHEN v_sort_sql = 'CONCAT(p.first_name, '' '', p.last_name) desc' THEN CONCAT(p.first_name, ' ', p.last_name) END) DESC,
           (CASE WHEN v_sort_sql = 'CONCAT(p.first_name, '' '', p.last_name) asc' THEN CONCAT(p.first_name, ' ', p.last_name) END) ASC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$$;


ALTER FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text", "p_page" integer, "p_page_size" integer, "p_sort_by" "text", "p_sort_direction" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text", "p_page" integer, "p_page_size" integer, "p_sort_by" "text", "p_sort_direction" "text") IS 'Returns paginated and filtered survey responses for a specific campaign instance with primary SBU and supervisor information';



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


CREATE OR REPLACE FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_campaign_data JSON;
  v_responses_data JSON;
BEGIN
  -- Get the campaign and survey data
  SELECT 
    json_build_object(
      'survey', json_build_object(
        'id', s.id,
        'name', s.name,
        'json_data', s.json_data
      )
    )
  INTO v_campaign_data
  FROM survey_campaigns sc
  JOIN surveys s ON s.id = sc.survey_id
  WHERE sc.id = p_campaign_id;

  -- Build a query for responses with user metadata
  WITH response_data AS (
    SELECT 
      r.id,
      r.response_data,
      r.submitted_at,
      json_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name,
        'email', p.email,
        'gender', p.gender,
        'location', CASE WHEN l.id IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END,
        'employment_type', CASE WHEN et.id IS NOT NULL THEN json_build_object('id', et.id, 'name', et.name) ELSE NULL END,
        'level', CASE WHEN lvl.id IS NOT NULL THEN json_build_object('id', lvl.id, 'name', lvl.name) ELSE NULL END,
        'employee_type', CASE WHEN emp_t.id IS NOT NULL THEN json_build_object('id', emp_t.id, 'name', emp_t.name) ELSE NULL END,
        'employee_role', CASE WHEN emp_r.id IS NOT NULL THEN json_build_object('id', emp_r.id, 'name', emp_r.name) ELSE NULL END,
        'user_sbus', (
          SELECT json_agg(
            json_build_object(
              'is_primary', us.is_primary,
              'sbu', json_build_object('id', sbu.id, 'name', sbu.name)
            )
          )
          FROM user_sbus us
          JOIN sbus sbu ON sbu.id = us.sbu_id
          WHERE us.user_id = p.id
        )
      ) AS user_data
    FROM survey_responses r
    JOIN profiles p ON p.id = r.user_id
    LEFT JOIN locations l ON l.id = p.location_id
    LEFT JOIN employment_types et ON et.id = p.employment_type_id
    LEFT JOIN levels lvl ON lvl.id = p.level_id
    LEFT JOIN employee_types emp_t ON emp_t.id = p.employee_type_id
    LEFT JOIN employee_roles emp_r ON emp_r.id = p.employee_role_id
    JOIN survey_assignments sa ON sa.id = r.assignment_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR r.campaign_instance_id = p_instance_id)
  )
  SELECT json_agg(rd.*)
  INTO v_responses_data
  FROM response_data rd;

  -- Combine the data and return
  RETURN json_build_object(
    'campaign', v_campaign_data,
    'responses', COALESCE(v_responses_data, '[]'::json)
  );
END;
$$;


ALTER FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") IS 'Get survey responses with all related demographic data for reporting';



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


CREATE OR REPLACE FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH response_texts AS (
    SELECT 
      r.response_data->>p_question_name AS answer_text
    FROM survey_responses r
    JOIN survey_assignments sa ON sa.id = r.assignment_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR r.campaign_instance_id = p_instance_id)
    AND r.response_data->>p_question_name IS NOT NULL
    AND LENGTH(r.response_data->>p_question_name) > 0
  ),
  -- This is a simple implementation of word frequency
  -- For more advanced text analysis, consider using extensions like pg_trgm
  word_counts AS (
    SELECT 
      word,
      COUNT(*) AS frequency
    FROM (
      SELECT 
        regexp_split_to_table(lower(answer_text), E'\\s+') AS word
      FROM response_texts
    ) AS words
    WHERE length(word) > 2  -- Ignore very short words
    AND word !~ '[^a-zA-Z]'  -- Only include alphabetic words
    GROUP BY word
    ORDER BY frequency DESC
    LIMIT 50  -- Limit to top 50 words
  )
  SELECT json_agg(
    json_build_object(
      'text', word,
      'value', frequency
    )
  )
  INTO v_result
  FROM word_counts;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;


ALTER FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") IS 'Perform word frequency analysis on text responses';



CREATE OR REPLACE FUNCTION "public"."handle_alignment_delete_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If it's a parent-child alignment, update the source (parent) objective
    IF OLD.alignment_type = 'parent_child' THEN
        PERFORM calculate_cascaded_objective_progress(OLD.source_objective_id);
    END IF;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_alignment_delete_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_buffer_minutes INTEGER := 2; -- Buffer time to ensure we don't miss instances
BEGIN
  -- Update instances that are past their start time but are still 'upcoming'
  UPDATE campaign_instances
  SET status = 'active', updated_at = NOW()
  WHERE campaign_id = p_campaign_id
    AND status = 'upcoming'
    AND starts_at <= (NOW() + (v_buffer_minutes || ' minutes')::INTERVAL)
    AND ends_at > NOW();
    
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log the execution
  IF v_updated_count > 0 THEN
    INSERT INTO campaign_instance_status_logs (
      updated_to_active, 
      updated_to_completed, 
      run_at, 
      details
    ) VALUES (
      v_updated_count,
      0,
      NOW(),
      jsonb_build_object(
        'campaign_id', p_campaign_id,
        'current_time', NOW(),
        'buffer_minutes', v_buffer_minutes,
        'instances_actually_updated', v_updated_count,
        'execution_details', 'Found ' || v_updated_count || ' eligible instances, activated ' || v_updated_count
      )
    );
  END IF;
  
  RETURN v_updated_count;
END;
$$;


ALTER FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_instance_completion"("p_campaign_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_buffer_minutes INTEGER := 2; -- Buffer time
  instance_id UUID;
BEGIN
  -- Update instances that are past their end time but are still 'active'
  UPDATE campaign_instances
  SET status = 'completed', updated_at = NOW()
  WHERE campaign_id = p_campaign_id
    AND status = 'active'
    AND ends_at <= (NOW() + (v_buffer_minutes || ' minutes')::INTERVAL);
    
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Recalculate completion rates for each completed instance
  IF v_updated_count > 0 THEN
    -- Log the execution
    INSERT INTO campaign_instance_status_logs (
      updated_to_active, 
      updated_to_completed, 
      run_at, 
      details
    ) VALUES (
      0,
      v_updated_count,
      NOW(),
      jsonb_build_object(
        'campaign_id', p_campaign_id,
        'current_time', NOW(),
        'buffer_minutes', v_buffer_minutes,
        'instances_actually_updated', v_updated_count,
        'execution_details', 'Found ' || v_updated_count || ' eligible instances, completed ' || v_updated_count
      )
    );
    
    -- Update completion rates
    FOR instance_id IN 
      SELECT id FROM campaign_instances 
      WHERE campaign_id = p_campaign_id 
      AND status = 'completed' 
      AND updated_at >= (NOW() - INTERVAL '5 minutes')
    LOOP
      PERFORM calculate_instance_completion_rate(instance_id);
    END LOOP;
  END IF;
  
  RETURN v_updated_count;
END;
$$;


ALTER FUNCTION "public"."handle_instance_completion"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_key_result_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Calculate progress for the objective this key result belongs to
    PERFORM calculate_cascaded_objective_progress(NEW.objective_id);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_key_result_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_key_result_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Calculate progress for the objective after a key result is deleted
    PERFORM calculate_cascaded_objective_progress(OLD.objective_id);
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_key_result_deletion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_kr_delete_cascaded_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Clean up any stale locks
    DELETE FROM okr_progress_calculation_lock
    WHERE updated_at < NOW() - INTERVAL '10 minutes';
    
    -- Update the objective progress for the objective that owned this key result
    PERFORM calculate_cascaded_objective_progress(OLD.objective_id);
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_kr_delete_cascaded_progress"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."handle_objective_cascade_to_parent"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If parent objective ID changed or progress changed significantly
    IF (OLD.parent_objective_id IS DISTINCT FROM NEW.parent_objective_id) OR 
       (ABS(COALESCE(OLD.progress, 0) - COALESCE(NEW.progress, 0)) > 0.01) THEN
        
        -- Update the old parent if it exists
        IF OLD.parent_objective_id IS NOT NULL THEN
            PERFORM calculate_cascaded_objective_progress(OLD.parent_objective_id);
        END IF;
        
        -- Update the new parent if it exists
        IF NEW.parent_objective_id IS NOT NULL THEN
            PERFORM calculate_cascaded_objective_progress(NEW.parent_objective_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_objective_cascade_to_parent"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_objective_delete_alignments"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Delete all alignments where this objective is the source
    DELETE FROM okr_alignments 
    WHERE source_objective_id = OLD.id;
    
    -- Delete all alignments where this objective is the target
    DELETE FROM okr_alignments 
    WHERE aligned_objective_id = OLD.id;
    
    -- Now we can proceed with deleting the objective itself
    -- (this happens automatically after the trigger)
    
    -- Log the cascade deletion
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        previous_data
    ) VALUES (
        OLD.id,
        'objective_alignment_cascade',
        'delete_cascade',
        auth.uid(),
        jsonb_build_object(
            'objective_id', OLD.id,
            'objective_title', OLD.title,
            'cascade_type', 'alignments'
        )
    );
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_objective_delete_alignments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_objective_delete_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- First, update any child objectives to remove the parent reference
    -- This addresses the foreign key constraint issue
    UPDATE objectives
    SET parent_objective_id = NULL
    WHERE parent_objective_id = OLD.id;
    
    -- Delete all alignments where this objective is the source
    DELETE FROM okr_alignments 
    WHERE source_objective_id = OLD.id;
    
    -- Delete all alignments where this objective is the target
    DELETE FROM okr_alignments 
    WHERE aligned_objective_id = OLD.id;
    
    -- Log the cascade deletion
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        previous_data
    ) VALUES (
        OLD.id,
        'objective_cascade_deletion',
        'delete_cascade',
        auth.uid(),
        jsonb_build_object(
            'objective_id', OLD.id,
            'objective_title', OLD.title,
            'cascade_types', jsonb_build_array('parent_child_relationships', 'alignments')
        )
    );
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_objective_delete_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_objective_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Log the objective deletion in okr_history
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        previous_data
    ) VALUES (
        OLD.id,
        'objective',
        'delete',
        auth.uid(),
        jsonb_build_object(
            'id', OLD.id,
            'title', OLD.title,
            'description', OLD.description,
            'status', OLD.status,
            'progress', OLD.progress,
            'visibility', OLD.visibility
        )
    );
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_objective_deletion"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."manage_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_cron_schedule" "text", "p_is_active" boolean) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_job_name TEXT;
  v_function_name TEXT;
  v_old_job_record RECORD;
  v_cron_job_id INTEGER;
BEGIN
  -- Validate job type
  IF p_job_type NOT IN ('activation', 'completion') THEN
    RAISE EXCEPTION 'Invalid job type. Must be "activation" or "completion"';
  END IF;
  
  -- Set function name based on job type
  IF p_job_type = 'activation' THEN
    v_function_name := 'handle_instance_activation';
  ELSE
    v_function_name := 'handle_instance_completion';
  END IF;
  
  -- Create standardized job name
  v_job_name := 'campaign_' || p_campaign_id || '_instance_' || p_job_type;
  
  -- Check if the job already exists
  SELECT * INTO v_old_job_record 
  FROM campaign_cron_jobs
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  -- If job exists in our tracking table, check cron.job
  IF FOUND THEN
    -- Try to unschedule the existing job if it's in cron.job
    BEGIN
      PERFORM cron.unschedule(v_old_job_record.job_name);
    EXCEPTION WHEN OTHERS THEN
      -- Job might not exist in cron.job table, ignore error
      NULL;
    END;
  END IF;
  
  -- Schedule the new job if it should be active
  IF p_is_active THEN
    v_cron_job_id := cron.schedule(
      v_job_name, 
      p_cron_schedule, 
      format('SELECT %s(''%s'')', v_function_name, p_campaign_id)
    );
  END IF;
  
  -- Update or insert entry in campaign_cron_jobs table
  IF FOUND THEN
    UPDATE campaign_cron_jobs
    SET 
      cron_schedule = p_cron_schedule,
      is_active = p_is_active,
      job_name = v_job_name,
      updated_at = NOW()
    WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  ELSE
    INSERT INTO campaign_cron_jobs (
      campaign_id,
      job_type,
      job_name,
      cron_schedule,
      is_active
    ) VALUES (
      p_campaign_id,
      p_job_type,
      v_job_name,
      p_cron_schedule,
      p_is_active
    );
  END IF;
  
  RETURN v_job_name;
END;
$$;


ALTER FUNCTION "public"."manage_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_cron_schedule" "text", "p_is_active" boolean) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."propagate_alignment_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_source_objective_id UUID;
    v_aligned_objective_id UUID;
    v_alignment_type TEXT;
BEGIN
    -- Get the alignment details
    SELECT 
        a.source_objective_id,
        a.aligned_objective_id,
        a.alignment_type
    INTO 
        v_source_objective_id,
        v_aligned_objective_id,
        v_alignment_type
    FROM okr_alignments a
    WHERE a.id = NEW.id;
    
    -- Only handle progress updates for parent-child alignments
    IF v_alignment_type = 'parent_child' THEN
        -- The source is the parent, so update its progress
        PERFORM calculate_cascaded_objective_progress(v_source_objective_id);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."propagate_alignment_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_all_cascaded_objective_progress"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_objective RECORD;
BEGIN
    -- First clean up any locks that might be left from failed calculations
    UPDATE okr_progress_calculation_lock SET locked = FALSE;
    
    -- First process leaf objectives (those without children)
    FOR v_objective IN 
        SELECT o.id 
        FROM objectives o
        WHERE NOT EXISTS (
            SELECT 1 FROM objectives child 
            WHERE child.parent_objective_id = o.id
        )
        ORDER BY o.id
    LOOP
        PERFORM calculate_cascaded_objective_progress(v_objective.id);
    END LOOP;
    
    -- Then process any remaining objectives that have children
    -- but haven't been processed yet (because their children changed them)
    FOR v_objective IN 
        SELECT o.id 
        FROM objectives o
        WHERE EXISTS (
            SELECT 1 FROM objectives child 
            WHERE child.parent_objective_id = o.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM okr_progress_calculation_lock
            WHERE objective_id = o.id AND locked = TRUE
        )
        ORDER BY o.id
    LOOP
        PERFORM calculate_cascaded_objective_progress(v_objective.id);
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."recalculate_all_cascaded_objective_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_all_objective_progress"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    obj_record RECORD;  -- Changed to RECORD type
    count INTEGER := 0;
BEGIN
    -- First, clear all locks to prevent issues
    DELETE FROM okr_progress_calculation_lock;
    
    -- Start with root objectives (those without parents)
    FOR obj_record IN 
        SELECT id FROM objectives 
        WHERE parent_objective_id IS NULL
    LOOP
        PERFORM calculate_cascaded_objective_progress(obj_record.id);
        count := count + 1;
    END LOOP;
    
    RETURN count;
END;
$$;


ALTER FUNCTION "public"."recalculate_all_objective_progress"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."recalculate_all_objective_progress"() IS 'Recalculates progress for all objectives in the system, starting with root objectives.';



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


CREATE OR REPLACE FUNCTION "public"."run_instance_job_now"("p_campaign_id" "uuid", "p_job_type" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result INTEGER;
BEGIN
  -- Validate job type
  IF p_job_type NOT IN ('activation', 'completion') THEN
    RAISE EXCEPTION 'Invalid job type. Must be "activation" or "completion"';
  END IF;
  
  -- Call the appropriate function
  IF p_job_type = 'activation' THEN
    SELECT handle_instance_activation(p_campaign_id) INTO v_result;
  ELSE
    SELECT handle_instance_completion(p_campaign_id) INTO v_result;
  END IF;
  
  -- Update last_run timestamp
  UPDATE campaign_cron_jobs
  SET last_run = NOW()
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."run_instance_job_now"("p_campaign_id" "uuid", "p_job_type" "text") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."search_objectives"("p_search_text" "text" DEFAULT ''::"text", "p_status_filters" "text"[] DEFAULT NULL::"text"[], "p_visibility_filters" "text"[] DEFAULT NULL::"text"[], "p_cycle_id" "uuid" DEFAULT NULL::"uuid", "p_sbu_id" "uuid" DEFAULT NULL::"uuid", "p_is_admin" boolean DEFAULT false, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_page_number" integer DEFAULT 1, "p_page_size" integer DEFAULT 10, "p_sort_column" "text" DEFAULT 'created_at'::"text", "p_sort_direction" "text" DEFAULT 'desc'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_offset INTEGER := (p_page_number - 1) * p_page_size;
  v_results JSONB;
  v_total_count INTEGER;
  v_sort_column TEXT := p_sort_column;
  v_sort_direction TEXT := p_sort_direction;
BEGIN
  -- Log function call for debugging
  INSERT INTO okr_history (
    entity_id,
    entity_type,
    change_type,
    changed_by,
    new_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'search_objectives_function',
    'function_call',
    p_user_id,
    jsonb_build_object(
      'search_text', p_search_text,
      'status_filters', p_status_filters,
      'visibility_filters', p_visibility_filters,
      'cycle_id', p_cycle_id,
      'sbu_id', p_sbu_id,
      'is_admin', p_is_admin,
      'page_number', p_page_number,
      'page_size', p_page_size,
      'sort_column', p_sort_column,
      'sort_direction', p_sort_direction
    )
  );

  -- Validate and sanitize sort inputs
  IF v_sort_column NOT IN ('title', 'owner', 'status', 'progress', 'created_at') THEN
    v_sort_column := 'created_at';
  END IF;
  
  IF v_sort_direction NOT IN ('asc', 'desc') THEN
    v_sort_direction := 'desc';
  END IF;

  -- Calculate total count first
  SELECT COUNT(DISTINCT o.id) INTO v_total_count
  FROM objectives o
  LEFT JOIN profiles p ON o.owner_id = p.id
  WHERE (
    p_is_admin -- Admin can see all objectives
    OR
    o.owner_id = p_user_id -- User can see their own objectives
    OR
    o.visibility = 'organization' -- Public objectives are visible to everyone
    OR
    (
      o.visibility = 'department' -- SBU objectives visible to members of the same SBU
      AND EXISTS (
        SELECT 1 FROM user_sbus us 
        WHERE us.user_id = p_user_id AND us.sbu_id = o.sbu_id
      )
    )
    OR
    ( -- User has explicit permission via okr_permissions
      EXISTS (
        SELECT 1 
        FROM okr_permissions op 
        WHERE op.objective_id = o.id 
        AND (
          p_user_id = ANY(op.user_ids)
          OR EXISTS (
            SELECT 1 FROM user_sbus us 
            WHERE us.user_id = p_user_id AND us.sbu_id = ANY(op.sbu_ids)
          )
          OR EXISTS (
            SELECT 1 FROM profiles prof 
            WHERE prof.id = p_user_id AND prof.employee_role_id = ANY(op.employee_role_ids)
          )
        )
        AND op.can_view = true
      )
    )
  )
  -- Apply search filter if provided
  AND (
    p_search_text = '' 
    OR o.title ILIKE '%' || p_search_text || '%' 
    OR o.description ILIKE '%' || p_search_text || '%'
    OR p.first_name ILIKE '%' || p_search_text || '%'
    OR p.last_name ILIKE '%' || p_search_text || '%'
    OR CONCAT(p.first_name, ' ', p.last_name) ILIKE '%' || p_search_text || '%'
  )
  -- Apply status filter if provided
  AND (p_status_filters IS NULL OR o.status::TEXT = ANY(p_status_filters))
  -- Apply visibility filter if provided
  AND (p_visibility_filters IS NULL OR o.visibility::TEXT = ANY(p_visibility_filters))
  -- Apply cycle filter if provided
  AND (p_cycle_id IS NULL OR o.cycle_id = p_cycle_id)
  -- Apply SBU filter if provided
  AND (p_sbu_id IS NULL OR o.sbu_id = p_sbu_id);

  -- Check if there are any results before proceeding
  IF v_total_count = 0 THEN
    -- Return empty result structure
    RETURN jsonb_build_array(
      jsonb_build_object(
        'objectives', jsonb_build_array(),
        'total_count', 0
      )
    );
  END IF;

  -- Now get the actual results with sorting and pagination
  WITH filtered_objectives AS (
    SELECT 
      o.*,
      -- Owner details
      p.first_name AS owner_first_name,
      p.last_name AS owner_last_name,
      -- Child count (for hierarchical view)
      (SELECT COUNT(*) FROM objectives child WHERE child.parent_objective_id = o.id) AS child_count,
      -- Key results count
      (SELECT COUNT(*) FROM key_results kr WHERE kr.objective_id = o.id) AS key_results_count
    FROM 
      objectives o
    LEFT JOIN 
      profiles p ON o.owner_id = p.id
    WHERE 
      (
        p_is_admin -- Admin can see all objectives
        OR
        o.owner_id = p_user_id -- User can see their own objectives
        OR
        o.visibility = 'organization'
        OR
        (
          o.visibility = 'department' -- SBU objectives visible to members of the same SBU
          AND EXISTS (
            SELECT 1 FROM user_sbus us 
            WHERE us.user_id = p_user_id AND us.sbu_id = o.sbu_id
          )
        )
        OR
        ( -- User has explicit permission via okr_permissions
          EXISTS (
            SELECT 1 
            FROM okr_permissions op 
            WHERE op.objective_id = o.id 
            AND (
              p_user_id = ANY(op.user_ids)
              OR EXISTS (
                SELECT 1 FROM user_sbus us 
                WHERE us.user_id = p_user_id AND us.sbu_id = ANY(op.sbu_ids)
              )
              OR EXISTS (
                SELECT 1 FROM profiles prof 
                WHERE prof.id = p_user_id AND prof.employee_role_id = ANY(op.employee_role_ids)
              )
            )
            AND op.can_view = true
          )
        )
      )
      -- Apply search filter if provided
      AND (
        p_search_text = '' 
        OR o.title ILIKE '%' || p_search_text || '%' 
        OR o.description ILIKE '%' || p_search_text || '%'
        OR p.first_name ILIKE '%' || p_search_text || '%'
        OR p.last_name ILIKE '%' || p_search_text || '%'
        OR CONCAT(p.first_name, ' ', p.last_name) ILIKE '%' || p_search_text || '%'
      )
      -- Apply status filter if provided
      AND (p_status_filters IS NULL OR o.status::TEXT = ANY(p_status_filters))
      -- Apply visibility filter if provided
      AND (p_visibility_filters IS NULL OR o.visibility::TEXT = ANY(p_visibility_filters))
      -- Apply cycle filter if provided
      AND (p_cycle_id IS NULL OR o.cycle_id = p_cycle_id)
      -- Apply SBU filter if provided
      AND (p_sbu_id IS NULL OR o.sbu_id = p_sbu_id)
  ),
  prepared_data AS (
    SELECT * FROM filtered_objectives
    ORDER BY
      CASE WHEN v_sort_column = 'title' AND v_sort_direction = 'asc' THEN title END,
      CASE WHEN v_sort_column = 'title' AND v_sort_direction = 'desc' THEN title END DESC,
      CASE WHEN v_sort_column = 'owner' AND v_sort_direction = 'asc' THEN CONCAT(owner_first_name, ' ', owner_last_name) END,
      CASE WHEN v_sort_column = 'owner' AND v_sort_direction = 'desc' THEN CONCAT(owner_first_name, ' ', owner_last_name) END DESC,
      CASE WHEN v_sort_column = 'status' AND v_sort_direction = 'asc' THEN status END,
      CASE WHEN v_sort_column = 'status' AND v_sort_direction = 'desc' THEN status END DESC,
      CASE WHEN v_sort_column = 'progress' AND v_sort_direction = 'asc' THEN progress END,
      CASE WHEN v_sort_column = 'progress' AND v_sort_direction = 'desc' THEN progress END DESC,
      CASE WHEN v_sort_column = 'created_at' AND v_sort_direction = 'asc' THEN created_at END,
      CASE WHEN v_sort_column = 'created_at' AND v_sort_direction = 'desc' THEN created_at END DESC
    LIMIT p_page_size
    OFFSET v_offset
  )
  SELECT 
    jsonb_build_object(
      'objectives', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', f.id,
            'title', f.title,
            'description', f.description,
            'status', f.status,
            'progress', f.progress,
            'visibility', f.visibility,
            'ownerId', f.owner_id,
            'cycleId', f.cycle_id,
            'parentObjectiveId', f.parent_objective_id,
            'sbuId', f.sbu_id,
            'createdAt', f.created_at,
            'updatedAt', f.updated_at,
            'approvalStatus', f.approval_status,
            'ownerName', CASE WHEN f.owner_first_name IS NOT NULL 
                            THEN CONCAT(f.owner_first_name, ' ', f.owner_last_name) 
                            ELSE NULL END,
            'keyResultsCount', f.key_results_count,
            'childCount', f.child_count
          )
        ),
        '[]'::jsonb  -- Return empty array if no rows found
      ),
      'total_count', v_total_count
    ) INTO v_results
  FROM prepared_data f;

  -- Log successful execution with result size
  INSERT INTO okr_history (
    entity_id,
    entity_type,
    change_type,
    changed_by,
    new_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'search_objectives_function',
    'execution_result',
    p_user_id,
    jsonb_build_object(
      'total_count', v_total_count,
      'result_size', CASE 
                        WHEN v_results->'objectives' IS NULL THEN 0
                        ELSE jsonb_array_length(v_results->'objectives')
                      END,
      'execution_time', clock_timestamp()
    )
  );

  RETURN jsonb_build_array(v_results);
END;
$$;


ALTER FUNCTION "public"."search_objectives"("p_search_text" "text", "p_status_filters" "text"[], "p_visibility_filters" "text"[], "p_cycle_id" "uuid", "p_sbu_id" "uuid", "p_is_admin" boolean, "p_user_id" "uuid", "p_page_number" integer, "p_page_size" integer, "p_sort_column" "text", "p_sort_direction" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_objectives"("p_search_text" "text", "p_status_filters" "text"[], "p_visibility_filters" "text"[], "p_cycle_id" "uuid", "p_sbu_id" "uuid", "p_is_admin" boolean, "p_user_id" "uuid", "p_page_number" integer, "p_page_size" integer, "p_sort_column" "text", "p_sort_direction" "text") IS 'Searches and filters objectives based on provided parameters with pagination, visibility rules and sorting';



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


CREATE OR REPLACE FUNCTION "public"."toggle_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_is_active" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_job_record RECORD;
BEGIN
  -- Get the job record
  SELECT * INTO v_job_record 
  FROM campaign_cron_jobs
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No job found for campaign_id % and job_type %', p_campaign_id, p_job_type;
  END IF;
  
  -- If we're activating and the job is currently inactive
  IF p_is_active AND NOT v_job_record.is_active THEN
    -- Schedule the job
    PERFORM cron.schedule(
      v_job_record.job_name, 
      v_job_record.cron_schedule, 
      CASE 
        WHEN v_job_record.job_type = 'activation' THEN 
          format('SELECT handle_instance_activation(''%s'')', p_campaign_id)
        ELSE 
          format('SELECT handle_instance_completion(''%s'')', p_campaign_id)
      END
    );
  -- If we're deactivating and the job is currently active
  ELSIF NOT p_is_active AND v_job_record.is_active THEN
    -- Unschedule the job
    PERFORM cron.unschedule(v_job_record.job_name);
  END IF;
  
  -- Update the record
  UPDATE campaign_cron_jobs
  SET 
    is_active = p_is_active,
    updated_at = NOW()
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."toggle_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_is_active" boolean) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_campaign_instance"("p_instance_id" "uuid", "p_new_starts_at" timestamp with time zone, "p_new_ends_at" timestamp with time zone, "p_new_status" "text") RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "period_number" integer, "starts_at" timestamp with time zone, "ends_at" timestamp with time zone, "status" "text", "completion_rate" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "error_message" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_instance RECORD;
BEGIN
  -- Fetch current instance data
  SELECT * INTO v_instance FROM campaign_instances WHERE campaign_instances.id = p_instance_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Instance not found';
    RETURN;
  END IF;

  -- Update the instance explicitly using the table alias 'ci'
  UPDATE campaign_instances ci
  SET
    starts_at = p_new_starts_at,
    ends_at = p_new_ends_at,
    status = p_new_status::instance_status,
    updated_at = now()
  WHERE ci.id = p_instance_id;

  -- Return the updated row with all columns explicitly qualified
  RETURN QUERY
    SELECT
      ci.id,
      ci.campaign_id,
      ci.period_number,
      ci.starts_at,
      ci.ends_at,
      ci.status::text,
      ci.completion_rate,
      ci.created_at,
      ci.updated_at,
      NULL::text as error_message
    FROM campaign_instances ci
    WHERE ci.id = p_instance_id;

END;
$$;


ALTER FUNCTION "public"."update_campaign_instance"("p_instance_id" "uuid", "p_new_starts_at" timestamp with time zone, "p_new_ends_at" timestamp with time zone, "p_new_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_cascaded_objective_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Clean up any stale locks
    DELETE FROM okr_progress_calculation_lock
    WHERE updated_at < NOW() - INTERVAL '10 minutes';
    
    -- Update the direct objective progress
    PERFORM calculate_cascaded_objective_progress(NEW.objective_id);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_cascaded_objective_progress"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."validate_kr_values"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Handle boolean type specifically
    IF NEW.measurement_type = 'boolean' THEN
        -- For boolean type, set progress based on boolean_value
        NEW.progress := CASE WHEN NEW.boolean_value THEN 100.0 ELSE 0.0 END;
    ELSE
        -- For numeric types, calculate percentage of progress
        IF NEW.target_value != NEW.start_value THEN
            NEW.progress := ((NEW.current_value - NEW.start_value) / (NEW.target_value - NEW.start_value)) * 100.0;
            -- Ensure progress is between 0-100
            NEW.progress := GREATEST(0.0, LEAST(100.0, NEW.progress));
        ELSE
            NEW.progress := CASE WHEN NEW.current_value >= NEW.target_value THEN 100.0 ELSE 0.0 END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_kr_values"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_kr_values_old"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Validation only applies to numeric measurement types
    IF NEW.measurement_type IN ('numeric', 'percentage', 'currency') THEN
        -- Validate numeric ranges
        IF NEW.start_value IS NOT NULL AND (NEW.start_value < -999.99 OR NEW.start_value > 999.99) THEN
            RAISE EXCEPTION 'Start value must be between -999.99 and 999.99';
        END IF;
        
        IF NEW.current_value IS NOT NULL AND (NEW.current_value < -999.99 OR NEW.current_value > 999.99) THEN
            RAISE EXCEPTION 'Current value must be between -999.99 and 999.99';
        END IF;
        
        IF NEW.target_value IS NOT NULL AND (NEW.target_value < -999.99 OR NEW.target_value > 999.99) THEN
            RAISE EXCEPTION 'Target value must be between -999.99 and 999.99';
        END IF;
    END IF;
    
    -- Handle boolean type specifically - this calculation will be kept
    IF NEW.measurement_type = 'boolean' THEN
        -- For boolean type, set progress based on boolean_value
        NEW.progress := CASE WHEN NEW.boolean_value THEN 100.0 ELSE 0.0 END;
    ELSE
        -- For numeric types, calculate percentage of progress
        IF NEW.target_value != NEW.start_value THEN
            NEW.progress := ((NEW.current_value - NEW.start_value) / (NEW.target_value - NEW.start_value)) * 100.0;
            -- Ensure progress is between 0-100
            NEW.progress := GREATEST(0.0, LEAST(100.0, NEW.progress));
        ELSE
            NEW.progress := CASE WHEN NEW.current_value >= NEW.target_value THEN 100.0 ELSE 0.0 END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_kr_values_old"() OWNER TO "postgres";

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


CREATE TABLE IF NOT EXISTS "public"."campaign_cron_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "job_name" "text" NOT NULL,
    "job_type" "text" NOT NULL,
    "cron_schedule" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_run" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "campaign_cron_jobs_job_type_check" CHECK (("job_type" = ANY (ARRAY['activation'::"text", 'completion'::"text"])))
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



CREATE OR REPLACE VIEW "public"."demographic_employee_role_analysis" WITH ("security_invoker"='on') AS
 SELECT COALESCE("er"."name", 'Not Specified'::"text") AS "employee_role",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employee_roles" "er" ON (("er"."id" = "p"."employee_role_id")))
  GROUP BY "er"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


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



CREATE OR REPLACE VIEW "public"."demographic_employee_type_analysis" WITH ("security_invoker"='on') AS
 SELECT COALESCE("et"."name", 'Not Specified'::"text") AS "employee_type",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employee_types" "et" ON (("et"."id" = "p"."employee_type_id")))
  GROUP BY "et"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


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


CREATE OR REPLACE VIEW "public"."demographic_employment_analysis" WITH ("security_invoker"='on') AS
 SELECT COALESCE("et"."name", 'Not Specified'::"text") AS "employment_type",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."employment_types" "et" ON (("et"."id" = "p"."employment_type_id")))
  GROUP BY "et"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


ALTER TABLE "public"."demographic_employment_analysis" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."demographic_gender_analysis" WITH ("security_invoker"='on') AS
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
    "color_code" "text" DEFAULT '#CBD5E1'::"text",
    "rank" integer
);


ALTER TABLE "public"."levels" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."demographic_level_analysis" WITH ("security_invoker"='on') AS
 SELECT COALESCE("l"."name", 'Not Specified'::"text") AS "level",
    "count"(DISTINCT "sr"."id") AS "response_count"
   FROM (("public"."survey_responses" "sr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "sr"."user_id")))
     LEFT JOIN "public"."levels" "l" ON (("l"."id" = "p"."level_id")))
  GROUP BY "l"."name"
  ORDER BY ("count"(DISTINCT "sr"."id")) DESC;


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


CREATE OR REPLACE VIEW "public"."demographic_location_analysis" WITH ("security_invoker"='on') AS
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


CREATE OR REPLACE VIEW "public"."department_performance" WITH ("security_invoker"='on') AS
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


CREATE TABLE IF NOT EXISTS "public"."key_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "objective_id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "kr_type" "text" NOT NULL,
    "start_value" double precision DEFAULT 0,
    "current_value" double precision DEFAULT 0,
    "target_value" double precision NOT NULL,
    "unit" "text",
    "weight" double precision DEFAULT 1,
    "status" "public"."kr_status" DEFAULT 'not_started'::"public"."kr_status" NOT NULL,
    "progress" double precision DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "measurement_type" "text" DEFAULT 'numeric'::"text",
    "boolean_value" boolean,
    "due_date" timestamp with time zone,
    CONSTRAINT "key_results_measurement_type_check" CHECK (("measurement_type" = ANY (ARRAY['numeric'::"text", 'percentage'::"text", 'currency'::"text", 'boolean'::"text"]))),
    CONSTRAINT "key_results_progress_check" CHECK ((("progress" >= ((0)::numeric)::double precision) AND ("progress" <= ((100)::numeric)::double precision))),
    CONSTRAINT "key_results_weight_check" CHECK (("weight" > ((0)::numeric)::double precision))
);


ALTER TABLE "public"."key_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."objectives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cycle_id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "status" "public"."objective_status" DEFAULT 'draft'::"public"."objective_status" NOT NULL,
    "progress" double precision DEFAULT 0,
    "visibility" "public"."okr_visibility" DEFAULT 'team'::"public"."okr_visibility" NOT NULL,
    "parent_objective_id" "uuid",
    "sbu_id" "uuid",
    "approval_status" "public"."approval_status" DEFAULT 'pending'::"public"."approval_status",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "progress_calculation_method" character varying(20) DEFAULT 'weighted_sum'::character varying,
    CONSTRAINT "objectives_progress_calculation_method_check" CHECK ((("progress_calculation_method")::"text" = ANY ((ARRAY['weighted_sum'::character varying, 'weighted_avg'::character varying])::"text"[]))),
    CONSTRAINT "objectives_progress_check" CHECK ((("progress" IS NULL) OR (("progress" >= (0)::double precision) AND ("progress" <= (100)::double precision))))
);


ALTER TABLE "public"."objectives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_check_ins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key_result_id" "uuid" NOT NULL,
    "previous_value" numeric,
    "new_value" numeric NOT NULL,
    "notes" "text",
    "status" "public"."check_in_status",
    "confidence_level" integer,
    "check_in_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "okr_check_ins_confidence_level_check" CHECK ((("confidence_level" >= 1) AND ("confidence_level" <= 10)))
);


ALTER TABLE "public"."okr_check_ins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "parent_comment_id" "uuid",
    "objective_id" "uuid",
    "key_result_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "comment_target_check" CHECK (((("objective_id" IS NOT NULL) AND ("key_result_id" IS NULL)) OR (("objective_id" IS NULL) AND ("key_result_id" IS NOT NULL))))
);


ALTER TABLE "public"."okr_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_cycles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "status" "public"."okr_cycle_status" DEFAULT 'upcoming'::"public"."okr_cycle_status" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."okr_cycles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."key_result_statistics" WITH ("security_invoker"='on') AS
 SELECT "kr"."id",
    "kr"."title",
    "kr"."description",
    "kr"."kr_type",
    "kr"."measurement_type",
    "kr"."unit",
    "kr"."start_value",
    "kr"."current_value",
    "kr"."target_value",
    "kr"."weight",
    "kr"."status",
    "kr"."progress",
    "kr"."objective_id",
    "kr"."owner_id",
    "o"."title" AS "objective_title",
    "oc"."id" AS "cycle_id",
    "oc"."name" AS "cycle_name",
    (("p"."first_name" || ' '::"text") || "p"."last_name") AS "owner_name",
    ( SELECT "max"("ci"."created_at") AS "max"
           FROM "public"."okr_check_ins" "ci"
          WHERE ("ci"."key_result_id" = "kr"."id")) AS "last_check_in",
    ( SELECT "count"(*) AS "count"
           FROM "public"."okr_check_ins" "ci"
          WHERE ("ci"."key_result_id" = "kr"."id")) AS "check_ins_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."okr_comments" "cmt"
          WHERE ("cmt"."key_result_id" = "kr"."id")) AS "comments_count"
   FROM ((("public"."key_results" "kr"
     JOIN "public"."objectives" "o" ON (("kr"."objective_id" = "o"."id")))
     JOIN "public"."okr_cycles" "oc" ON (("o"."cycle_id" = "oc"."id")))
     LEFT JOIN "public"."profiles" "p" ON (("kr"."owner_id" = "p"."id")));


ALTER TABLE "public"."key_result_statistics" OWNER TO "postgres";


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


CREATE OR REPLACE VIEW "public"."managers_needing_improvement" WITH ("security_invoker"='on') AS
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



CREATE TABLE IF NOT EXISTS "public"."okr_alignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_objective_id" "uuid" NOT NULL,
    "aligned_objective_id" "uuid" NOT NULL,
    "alignment_type" "text" NOT NULL,
    "weight" numeric(5,2) DEFAULT 1,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "no_self_alignment" CHECK (("source_objective_id" <> "aligned_objective_id")),
    CONSTRAINT "okr_alignment_weight_check" CHECK (("weight" > (0)::numeric))
);


ALTER TABLE "public"."okr_alignments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."objective_statistics" WITH ("security_invoker"='on') AS
 SELECT "o"."id",
    "o"."title",
    "o"."description",
    "o"."status",
    "o"."progress",
    "o"."visibility",
    "o"."parent_objective_id",
    "o"."sbu_id",
    "o"."approval_status",
    "o"."owner_id",
    "o"."cycle_id",
    "oc"."name" AS "cycle_name",
    (("p"."first_name" || ' '::"text") || "p"."last_name") AS "owner_name",
    "s"."name" AS "sbu_name",
    ( SELECT "count"(*) AS "count"
           FROM "public"."key_results" "kr"
          WHERE ("kr"."objective_id" = "o"."id")) AS "key_results_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."key_results" "kr"
          WHERE (("kr"."objective_id" = "o"."id") AND ("kr"."status" = 'completed'::"public"."kr_status"))) AS "completed_key_results",
    ( SELECT "count"(*) AS "count"
           FROM "public"."okr_alignments" "al"
          WHERE (("al"."source_objective_id" = "o"."id") OR ("al"."aligned_objective_id" = "o"."id"))) AS "alignments_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."okr_comments" "c"
          WHERE ("c"."objective_id" = "o"."id")) AS "comments_count",
    ( SELECT "count"(*) AS "count"
           FROM ("public"."okr_check_ins" "ci"
             JOIN "public"."key_results" "kr" ON (("ci"."key_result_id" = "kr"."id")))
          WHERE ("kr"."objective_id" = "o"."id")) AS "check_ins_count"
   FROM ((("public"."objectives" "o"
     JOIN "public"."okr_cycles" "oc" ON (("o"."cycle_id" = "oc"."id")))
     LEFT JOIN "public"."profiles" "p" ON (("o"."owner_id" = "p"."id")))
     LEFT JOIN "public"."sbus" "s" ON (("o"."sbu_id" = "s"."id")));


ALTER TABLE "public"."objective_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_default_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "default_progress_calculation_method" character varying(20) DEFAULT 'weighted_sum'::character varying
);


ALTER TABLE "public"."okr_default_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "change_type" "text" NOT NULL,
    "previous_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "uuid" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."okr_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "read" boolean DEFAULT false,
    "notification_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."okr_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "objective_id" "uuid" NOT NULL,
    "sbu_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "user_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "employee_role_ids" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "can_view" boolean DEFAULT true,
    "can_comment" boolean DEFAULT false,
    "can_edit" boolean DEFAULT false,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."okr_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_progress_calculation_lock" (
    "objective_id" "uuid" NOT NULL,
    "locked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."okr_progress_calculation_lock" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."okr_role_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "can_create_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_create_org_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_create_dept_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_create_team_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_create_key_results" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_create_alignments" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_align_with_org_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_align_with_dept_objectives" "uuid"[] DEFAULT '{}'::"uuid"[],
    "can_align_with_team_objectives" "uuid"[] DEFAULT '{}'::"uuid"[]
);


ALTER TABLE "public"."okr_role_settings" OWNER TO "postgres";


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



CREATE OR REPLACE VIEW "public"."recent_activities" WITH ("security_invoker"='on') AS
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


CREATE OR REPLACE VIEW "public"."response_trends" WITH ("security_invoker"='on') AS
 SELECT "date_trunc"('day'::"text", "sr"."created_at") AS "response_date",
    "count"(*) AS "response_count",
    "count"(DISTINCT "sr"."user_id") AS "unique_respondents"
   FROM "public"."survey_responses" "sr"
  GROUP BY ("date_trunc"('day'::"text", "sr"."created_at"))
  ORDER BY ("date_trunc"('day'::"text", "sr"."created_at"));


ALTER TABLE "public"."response_trends" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shared_presentations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "instance_id" "uuid",
    "access_token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "title" "text",
    "description" "text"
);


ALTER TABLE "public"."shared_presentations" OWNER TO "postgres";


COMMENT ON TABLE "public"."shared_presentations" IS 'Table for storing public shareable presentation links';



COMMENT ON COLUMN "public"."shared_presentations"."access_token" IS 'Secure token for public access without authentication';



COMMENT ON COLUMN "public"."shared_presentations"."expires_at" IS 'Optional expiration date for the shared link';



CREATE OR REPLACE VIEW "public"."silent_employees" WITH ("security_invoker"='on') AS
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



CREATE OR REPLACE VIEW "public"."survey_overview_metrics" WITH ("security_invoker"='on') AS
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


CREATE OR REPLACE VIEW "public"."survey_response_trends" WITH ("security_invoker"='on') AS
 SELECT ("survey_responses"."created_at")::"date" AS "date",
    "count"(*) AS "response_count",
    "count"(DISTINCT "survey_responses"."user_id") AS "unique_respondents"
   FROM "public"."survey_responses"
  GROUP BY (("survey_responses"."created_at")::"date")
  ORDER BY (("survey_responses"."created_at")::"date") DESC;


ALTER TABLE "public"."survey_response_trends" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_performing_managers" WITH ("security_invoker"='on') AS
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



CREATE OR REPLACE VIEW "public"."top_performing_sbus" WITH ("security_invoker"='on') AS
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


CREATE OR REPLACE VIEW "public"."top_performing_surveys" WITH ("security_invoker"='on') AS
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


CREATE OR REPLACE VIEW "public"."upcoming_survey_deadlines" WITH ("security_invoker"='on') AS
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



ALTER TABLE ONLY "public"."campaign_cron_jobs"
    ADD CONSTRAINT "campaign_cron_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_instance_status_logs"
    ADD CONSTRAINT "campaign_instance_status_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "campaign_instances_campaign_id_period_number_key" UNIQUE ("campaign_id", "period_number");



ALTER TABLE ONLY "public"."campaign_instances"
    ADD CONSTRAINT "campaign_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_config"
    ADD CONSTRAINT "email_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_config"
    ADD CONSTRAINT "email_config_provider_key" UNIQUE ("provider");



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



ALTER TABLE ONLY "public"."key_results"
    ADD CONSTRAINT "key_results_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_alignments"
    ADD CONSTRAINT "okr_alignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_check_ins"
    ADD CONSTRAINT "okr_check_ins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_comments"
    ADD CONSTRAINT "okr_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_cycles"
    ADD CONSTRAINT "okr_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_default_settings"
    ADD CONSTRAINT "okr_default_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_history"
    ADD CONSTRAINT "okr_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_notifications"
    ADD CONSTRAINT "okr_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_permissions"
    ADD CONSTRAINT "okr_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."okr_progress_calculation_lock"
    ADD CONSTRAINT "okr_progress_calculation_lock_pkey" PRIMARY KEY ("objective_id");



ALTER TABLE ONLY "public"."okr_role_settings"
    ADD CONSTRAINT "okr_role_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbus"
    ADD CONSTRAINT "sbus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_presentations"
    ADD CONSTRAINT "shared_presentations_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."okr_alignments"
    ADD CONSTRAINT "unique_alignment" UNIQUE ("source_objective_id", "aligned_objective_id");



ALTER TABLE ONLY "public"."shared_presentations"
    ADD CONSTRAINT "unique_campaign_instance_token" UNIQUE ("campaign_id", "instance_id", "access_token");



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



CREATE INDEX "idx_alignments_aligned" ON "public"."okr_alignments" USING "btree" ("aligned_objective_id");



CREATE INDEX "idx_alignments_source" ON "public"."okr_alignments" USING "btree" ("source_objective_id");



CREATE INDEX "idx_check_ins_key_result" ON "public"."okr_check_ins" USING "btree" ("key_result_id");



CREATE INDEX "idx_comments_key_result" ON "public"."okr_comments" USING "btree" ("key_result_id");



CREATE INDEX "idx_comments_objective" ON "public"."okr_comments" USING "btree" ("objective_id");



CREATE INDEX "idx_history_entity_type_id" ON "public"."okr_history" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_issue_board_permissions_board_id" ON "public"."issue_board_permissions" USING "btree" ("board_id");



CREATE INDEX "idx_issue_votes_issue_id" ON "public"."issue_votes" USING "btree" ("issue_id");



CREATE INDEX "idx_issue_votes_user_id" ON "public"."issue_votes" USING "btree" ("user_id");



CREATE INDEX "idx_issues_board_id" ON "public"."issues" USING "btree" ("board_id");



CREATE INDEX "idx_key_results_objective" ON "public"."key_results" USING "btree" ("objective_id");



CREATE INDEX "idx_key_results_owner" ON "public"."key_results" USING "btree" ("owner_id");



CREATE INDEX "idx_live_session_participants_session" ON "public"."live_session_participants" USING "btree" ("session_id");



CREATE INDEX "idx_live_session_participants_status" ON "public"."live_session_participants" USING "btree" ("status");



CREATE INDEX "idx_live_session_questions_session_id" ON "public"."live_session_questions" USING "btree" ("session_id");



CREATE INDEX "idx_live_session_responses_question_key" ON "public"."live_session_responses" USING "btree" ("question_key");



CREATE INDEX "idx_live_survey_sessions_join_code" ON "public"."live_survey_sessions" USING "btree" ("join_code");



CREATE INDEX "idx_notifications_user" ON "public"."okr_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_objectives_cycle" ON "public"."objectives" USING "btree" ("cycle_id");



CREATE INDEX "idx_objectives_owner" ON "public"."objectives" USING "btree" ("owner_id");



CREATE INDEX "idx_objectives_sbu" ON "public"."objectives" USING "btree" ("sbu_id");



CREATE INDEX "idx_okr_progress_calculation_lock_locked" ON "public"."okr_progress_calculation_lock" USING "btree" ("locked");



CREATE INDEX "idx_permissions_objective" ON "public"."okr_permissions" USING "btree" ("objective_id");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_email_pattern" ON "public"."profiles" USING "btree" ("email" "text_pattern_ops");



CREATE INDEX "idx_profiles_first_name" ON "public"."profiles" USING "btree" ("first_name");



CREATE INDEX "idx_profiles_first_name_pattern" ON "public"."profiles" USING "btree" ("first_name" "text_pattern_ops");



CREATE INDEX "idx_profiles_last_name" ON "public"."profiles" USING "btree" ("last_name");



CREATE INDEX "idx_profiles_last_name_pattern" ON "public"."profiles" USING "btree" ("last_name" "text_pattern_ops");



CREATE INDEX "idx_profiles_name_search" ON "public"."profiles" USING "btree" ("email", "first_name", "last_name");



CREATE INDEX "idx_profiles_org_id" ON "public"."profiles" USING "btree" ("org_id");



CREATE INDEX "idx_profiles_org_id_pattern" ON "public"."profiles" USING "btree" ("org_id" "text_pattern_ops");



CREATE INDEX "idx_sbus_head_id" ON "public"."sbus" USING "btree" ("head_id");



CREATE INDEX "idx_shared_presentations_token" ON "public"."shared_presentations" USING "btree" ("access_token");



CREATE INDEX "idx_survey_assignments_campaign_id" ON "public"."survey_assignments" USING "btree" ("campaign_id");



CREATE INDEX "idx_survey_assignments_last_reminder" ON "public"."survey_assignments" USING "btree" ("last_reminder_sent");



CREATE UNIQUE INDEX "idx_survey_assignments_public_access_token" ON "public"."survey_assignments" USING "btree" ("public_access_token");



CREATE INDEX "idx_survey_assignments_survey_id" ON "public"."survey_assignments" USING "btree" ("survey_id");



CREATE INDEX "idx_survey_assignments_user_id" ON "public"."survey_assignments" USING "btree" ("user_id");



CREATE INDEX "idx_survey_campaigns_survey_id" ON "public"."survey_campaigns" USING "btree" ("survey_id");



CREATE INDEX "idx_survey_responses_assignment_id" ON "public"."survey_responses" USING "btree" ("assignment_id");



CREATE INDEX "idx_survey_responses_assignment_instance" ON "public"."survey_responses" USING "btree" ("assignment_id", "campaign_instance_id");



CREATE UNIQUE INDEX "unique_user_assignment_instance" ON "public"."survey_responses" USING "btree" ("assignment_id", "user_id", "campaign_instance_id") WHERE ("status" <> 'submitted'::"public"."response_status");



CREATE OR REPLACE TRIGGER "before_delete_campaign" BEFORE DELETE ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."delete_campaign_cascade"();



CREATE OR REPLACE TRIGGER "cascade_kr_delete_progress" AFTER DELETE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."handle_kr_delete_cascaded_progress"();



CREATE OR REPLACE TRIGGER "cascade_kr_progress_update" AFTER INSERT OR UPDATE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_cascaded_objective_progress"();



CREATE OR REPLACE TRIGGER "cascade_objective_to_parent" AFTER UPDATE ON "public"."objectives" FOR EACH ROW EXECUTE FUNCTION "public"."handle_objective_cascade_to_parent"();



CREATE OR REPLACE TRIGGER "check_achievements_after_survey" AFTER INSERT OR UPDATE OF "status" ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_check_achievements"();



CREATE OR REPLACE TRIGGER "create_live_session_questions" AFTER INSERT ON "public"."live_survey_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_live_session_questions"();



CREATE OR REPLACE TRIGGER "ensure_public_access_token" BEFORE INSERT ON "public"."survey_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."generate_public_access_token"();



CREATE OR REPLACE TRIGGER "generate_instances_trigger" AFTER INSERT ON "public"."survey_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."generate_initial_instances"();



CREATE OR REPLACE TRIGGER "handle_alignment_delete_trigger" AFTER DELETE ON "public"."okr_alignments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_alignment_delete_progress"();



CREATE OR REPLACE TRIGGER "handle_key_result_changes_trigger" AFTER INSERT OR UPDATE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."handle_key_result_changes"();



CREATE OR REPLACE TRIGGER "handle_key_result_deletion_trigger" AFTER DELETE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."handle_key_result_deletion"();



CREATE OR REPLACE TRIGGER "handle_objective_delete_cascade_trigger" BEFORE DELETE ON "public"."objectives" FOR EACH ROW EXECUTE FUNCTION "public"."handle_objective_delete_cascade"();



COMMENT ON TRIGGER "handle_objective_delete_cascade_trigger" ON "public"."objectives" IS 'Trigger to handle cascading deletions when an objective is deleted - updates child objectives and removes alignments';



CREATE OR REPLACE TRIGGER "handle_objective_deletion_trigger" BEFORE DELETE ON "public"."objectives" FOR EACH ROW EXECUTE FUNCTION "public"."handle_objective_deletion"();



CREATE OR REPLACE TRIGGER "issue_downvote_count_trigger" AFTER INSERT OR DELETE ON "public"."issue_downvotes" FOR EACH ROW EXECUTE FUNCTION "public"."update_issue_downvote_count"();



CREATE OR REPLACE TRIGGER "key_results_validate_trigger" BEFORE INSERT OR UPDATE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."validate_kr_values"();



CREATE OR REPLACE TRIGGER "link_response_to_active_instance_trigger" BEFORE INSERT ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."link_response_to_active_instance"();



CREATE OR REPLACE TRIGGER "prevent_duplicate_responses_trigger" BEFORE INSERT ON "public"."live_session_responses" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_duplicate_responses"();



CREATE OR REPLACE TRIGGER "prevent_submitted_response_modification" BEFORE UPDATE ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_modifying_submitted_responses"();



CREATE OR REPLACE TRIGGER "propagate_alignment_progress_trigger" AFTER INSERT ON "public"."okr_alignments" FOR EACH ROW EXECUTE FUNCTION "public"."propagate_alignment_progress"();



CREATE OR REPLACE TRIGGER "question_activation_trigger" BEFORE UPDATE ON "public"."live_session_questions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_question_activation"();



CREATE OR REPLACE TRIGGER "update_achievement_progress_updated_at" BEFORE UPDATE ON "public"."achievement_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_achievements_updated_at" BEFORE UPDATE ON "public"."achievements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_analysis_prompts_updated_at" BEFORE UPDATE ON "public"."analysis_prompts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campaign_instances_updated_at" BEFORE UPDATE ON "public"."campaign_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_config_updated_at" BEFORE UPDATE ON "public"."email_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employee_roles_updated_at" BEFORE UPDATE ON "public"."employee_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employee_types_updated_at" BEFORE UPDATE ON "public"."employee_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employment_types_updated_at" BEFORE UPDATE ON "public"."employment_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instance_completion_rate_on_response" AFTER INSERT OR UPDATE ON "public"."survey_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_instance_completion_rate"();



CREATE OR REPLACE TRIGGER "update_issue_board_permissions_updated_at" BEFORE UPDATE ON "public"."issue_board_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_issue_boards_updated_at" BEFORE UPDATE ON "public"."issue_boards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_issues_updated_at" BEFORE UPDATE ON "public"."issues" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_key_results_updated_at" BEFORE UPDATE ON "public"."key_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_levels_updated_at" BEFORE UPDATE ON "public"."levels" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_participants_updated_at" BEFORE UPDATE ON "public"."live_session_participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_questions_updated_at" BEFORE UPDATE ON "public"."live_session_questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_session_responses_updated_at" BEFORE UPDATE ON "public"."live_session_responses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_live_survey_sessions_updated_at" BEFORE UPDATE ON "public"."live_survey_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_locations_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_objectives_updated_at" BEFORE UPDATE ON "public"."objectives" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_okr_comments_updated_at" BEFORE UPDATE ON "public"."okr_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_okr_cycles_updated_at" BEFORE UPDATE ON "public"."okr_cycles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_okr_permissions_updated_at" BEFORE UPDATE ON "public"."okr_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_okr_role_settings_updated_at" BEFORE UPDATE ON "public"."okr_role_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



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



ALTER TABLE ONLY "public"."key_results"
    ADD CONSTRAINT "key_results_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."key_results"
    ADD CONSTRAINT "key_results_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



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



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."okr_cycles"("id");



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_parent_objective_id_fkey" FOREIGN KEY ("parent_objective_id") REFERENCES "public"."objectives"("id");



ALTER TABLE ONLY "public"."objectives"
    ADD CONSTRAINT "objectives_sbu_id_fkey" FOREIGN KEY ("sbu_id") REFERENCES "public"."sbus"("id");



ALTER TABLE ONLY "public"."okr_alignments"
    ADD CONSTRAINT "okr_alignments_aligned_objective_id_fkey" FOREIGN KEY ("aligned_objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_alignments"
    ADD CONSTRAINT "okr_alignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_alignments"
    ADD CONSTRAINT "okr_alignments_source_objective_id_fkey" FOREIGN KEY ("source_objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_check_ins"
    ADD CONSTRAINT "okr_check_ins_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_check_ins"
    ADD CONSTRAINT "okr_check_ins_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "public"."key_results"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."okr_comments"
    ADD CONSTRAINT "okr_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_comments"
    ADD CONSTRAINT "okr_comments_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "public"."key_results"("id");



ALTER TABLE ONLY "public"."okr_comments"
    ADD CONSTRAINT "okr_comments_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id");



ALTER TABLE ONLY "public"."okr_comments"
    ADD CONSTRAINT "okr_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."okr_comments"("id");



ALTER TABLE ONLY "public"."okr_cycles"
    ADD CONSTRAINT "okr_cycles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_history"
    ADD CONSTRAINT "okr_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_notifications"
    ADD CONSTRAINT "okr_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_permissions"
    ADD CONSTRAINT "okr_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."okr_permissions"
    ADD CONSTRAINT "okr_permissions_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."shared_presentations"
    ADD CONSTRAINT "shared_presentations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."survey_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_presentations"
    ADD CONSTRAINT "shared_presentations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shared_presentations"
    ADD CONSTRAINT "shared_presentations_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."campaign_instances"("id") ON DELETE CASCADE;



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



CREATE POLICY "Administrators have full access to key results" ON "public"."key_results" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



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



CREATE POLICY "Admins can manage all objectives" ON "public"."objectives" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage issue boards" ON "public"."issue_boards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage permissions" ON "public"."issue_board_permissions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage shared presentations" ON "public"."shared_presentations" TO "authenticated" USING ((EXISTS ( SELECT 1
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



CREATE POLICY "Allow full access for admins" ON "public"."campaign_cron_jobs" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Allow participants to submit responses" ON "public"."live_session_responses" FOR INSERT TO "anon" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."live_session_participants"
  WHERE (("live_session_participants"."session_id" = "live_session_responses"."session_id") AND ("live_session_participants"."participant_id" = "auth"."uid"()) AND ("live_session_participants"."status" = 'connected'::"text")))));



CREATE POLICY "Allow public access to response aggregated data via token" ON "public"."survey_responses" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."shared_presentations" "sp"
  WHERE ((("survey_responses"."campaign_instance_id" = "sp"."instance_id") OR ("sp"."instance_id" IS NULL)) AND (EXISTS ( SELECT 1
           FROM "public"."survey_assignments" "sa"
          WHERE (("sa"."id" = "survey_responses"."assignment_id") AND ("sa"."campaign_id" = "sp"."campaign_id")))) AND ("sp"."is_active" = true) AND (("sp"."expires_at" IS NULL) OR ("sp"."expires_at" > "now"()))))));



CREATE POLICY "Allow public access to shared presentations via token" ON "public"."shared_presentations" FOR SELECT TO "anon" USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Allow public access to survey assignments with token" ON "public"."survey_assignments" FOR SELECT USING ((("public_access_token" IS NOT NULL) OR ("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow public access to surveys via assignment token" ON "public"."surveys" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."survey_id" = "surveys"."id") AND ("survey_assignments"."public_access_token" IS NOT NULL)))));



CREATE POLICY "Allow public access to surveys via presentation token" ON "public"."surveys" FOR SELECT TO "anon" USING ((EXISTS ( SELECT 1
   FROM ("public"."shared_presentations" "sp"
     JOIN "public"."survey_campaigns" "sc" ON (("sp"."campaign_id" = "sc"."id")))
  WHERE (("sc"."survey_id" = "surveys"."id") AND ("sp"."is_active" = true) AND (("sp"."expires_at" IS NULL) OR ("sp"."expires_at" > "now"()))))));



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



CREATE POLICY "Anyone can create notifications" ON "public"."okr_notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



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



CREATE POLICY "Enable read access for all users" ON "public"."key_results" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."live_session_questions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."live_session_responses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."okr_role_settings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."sbus" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."survey_campaigns" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_sbus" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_supervisors" FOR SELECT USING (true);



CREATE POLICY "Enable system to insert achievements" ON "public"."user_achievements" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable system to update achievements" ON "public"."user_achievements" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable users to view permitted data" ON "public"."issue_downvotes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."issues" "i"
  WHERE (("i"."id" = "issue_downvotes"."issue_id") AND (EXISTS ( SELECT 1
           FROM (("public"."issue_board_permissions" "ibp"
             JOIN "public"."profiles" "p" ON (("auth"."uid"() = "p"."id")))
             LEFT JOIN "public"."user_sbus" "us" ON (("p"."id" = "us"."user_id")))))))));



CREATE POLICY "Enable write access for creators and admins" ON "public"."live_survey_sessions" TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))))) WITH CHECK ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Enable write access for session creators" ON "public"."live_session_questions" USING ((EXISTS ( SELECT 1
   FROM "public"."live_survey_sessions" "s"
  WHERE (("s"."id" = "live_session_questions"."session_id") AND ("s"."created_by" = "auth"."uid"())))));



CREATE POLICY "Everyone can view OKR cycles" ON "public"."okr_cycles" FOR SELECT USING (true);



CREATE POLICY "Only admins can create OKR cycles" ON "public"."okr_cycles" FOR INSERT WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Only admins can delete OKR cycles" ON "public"."okr_cycles" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Only admins can modify campaign instances" ON "public"."campaign_instances" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can update OKR cycles" ON "public"."okr_cycles" FOR UPDATE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Policy with security definer functions" ON "public"."issue_downvotes" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."issues" "i"
     JOIN "public"."issue_board_permissions" "ibp" ON (("i"."board_id" = "ibp"."board_id")))
  WHERE (("i"."id" = "issue_downvotes"."issue_id") AND ("ibp"."can_vote" = true))))));



CREATE POLICY "System can manage user achievements" ON "public"."user_achievements" TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Users can create alignments" ON "public"."okr_alignments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create check-ins" ON "public"."okr_check_ins" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create comments" ON "public"."okr_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create history entries" ON "public"."okr_history" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can create issues in boards they have access to" ON "public"."issues" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM (("public"."issue_board_permissions" "ibp"
     JOIN "public"."profiles" "p" ON (("auth"."uid"() = "p"."id")))
     LEFT JOIN "public"."user_sbus" "us" ON (("p"."id" = "us"."user_id")))
  WHERE (("ibp"."board_id" = "issues"."board_id") AND (("ibp"."level_ids" IS NULL) OR ("ibp"."level_ids" = '{}'::"uuid"[]) OR ("p"."level_id" = ANY ("ibp"."level_ids")) OR (("ibp"."location_ids" IS NULL) OR ("ibp"."location_ids" = '{}'::"uuid"[]) OR ("p"."location_id" = ANY ("ibp"."location_ids"))) OR (("ibp"."employment_type_ids" IS NULL) OR ("ibp"."employment_type_ids" = '{}'::"uuid"[]) OR ("p"."employment_type_id" = ANY ("ibp"."employment_type_ids"))) OR (("ibp"."employee_type_ids" IS NULL) OR ("ibp"."employee_type_ids" = '{}'::"uuid"[]) OR ("p"."employee_type_id" = ANY ("ibp"."employee_type_ids"))) OR (("ibp"."employee_role_ids" IS NULL) OR ("ibp"."employee_role_ids" = '{}'::"uuid"[]) OR ("p"."employee_role_id" = ANY ("ibp"."employee_role_ids"))) OR (("ibp"."sbu_ids" IS NULL) OR ("ibp"."sbu_ids" = '{}'::"uuid"[]) OR ("us"."sbu_id" = ANY ("ibp"."sbu_ids")))) AND ("ibp"."can_create" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can create key results" ON "public"."key_results" FOR INSERT WITH CHECK ((("auth"."uid"() = "owner_id") AND (EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND (("objectives"."owner_id" = "auth"."uid"()) OR ("objectives"."visibility" = 'organization'::"public"."okr_visibility") OR (("objectives"."visibility" = 'team'::"public"."okr_visibility") AND (EXISTS ( SELECT 1
           FROM "public"."user_sbus"
          WHERE (("user_sbus"."user_id" = "auth"."uid"()) AND ("user_sbus"."sbu_id" = "objectives"."sbu_id")))))))))));



CREATE POLICY "Users can create key results for objectives they own" ON "public"."key_results" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND ("objectives"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Users can create permissions" ON "public"."okr_permissions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete key results for objectives they own" ON "public"."key_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND ("objectives"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete permissions they created" ON "public"."okr_permissions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their alignments" ON "public"."okr_alignments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their check-ins" ON "public"."okr_check_ins" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their comments" ON "public"."okr_comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their key results" ON "public"."key_results" FOR DELETE USING ((("auth"."uid"() = "owner_id") OR (EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND ("objectives"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can delete their notifications" ON "public"."okr_notifications" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own issues or if admin" ON "public"."issues" FOR DELETE USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can delete their own objectives" ON "public"."objectives" FOR DELETE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can insert their own objectives" ON "public"."objectives" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can manage their own shared presentations" ON "public"."shared_presentations" TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can manage their own votes" ON "public"."issue_votes" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."issues" "i"
     JOIN "public"."issue_board_permissions" "ibp" ON (("i"."board_id" = "ibp"."board_id")))
  WHERE (("i"."id" = "issue_votes"."issue_id") AND ("ibp"."can_vote" = true))))));



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



CREATE POLICY "Users can update key results for objectives they own" ON "public"."key_results" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND ("objectives"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Users can update permissions they created" ON "public"."okr_permissions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their alignments" ON "public"."okr_alignments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their check-ins" ON "public"."okr_check_ins" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their comments" ON "public"."okr_comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their extended profile fields" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))))) WITH CHECK ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can update their key results" ON "public"."key_results" FOR UPDATE USING ((("auth"."uid"() = "owner_id") OR (EXISTS ( SELECT 1
   FROM "public"."objectives"
  WHERE (("objectives"."id" = "key_results"."objective_id") AND ("objectives"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update their notifications" ON "public"."okr_notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own issues" ON "public"."issues" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own objectives" ON "public"."objectives" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update/delete their own issues" ON "public"."issues" USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can view active employee roles" ON "public"."employee_roles" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active employee types" ON "public"."employee_types" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active employment types" ON "public"."employment_types" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view active levels" ON "public"."levels" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Users can view alignments" ON "public"."okr_alignments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view all locations" ON "public"."locations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view check-ins" ON "public"."okr_check_ins" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view comments" ON "public"."okr_comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view history" ON "public"."okr_history" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view instances of campaigns they're assigned to" ON "public"."campaign_instances" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."campaign_id" = "campaign_instances"."campaign_id") AND ("survey_assignments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view organization objectives" ON "public"."objectives" FOR SELECT USING (("visibility" = ANY (ARRAY['team'::"public"."okr_visibility", 'organization'::"public"."okr_visibility", 'department'::"public"."okr_visibility"])));



CREATE POLICY "Users can view permissions" ON "public"."okr_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view responses for campaigns they manage" ON "public"."survey_responses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."survey_assignments" "sa"
     JOIN "public"."survey_campaigns" "sc" ON (("sa"."campaign_id" = "sc"."id")))
  WHERE (("sa"."id" = "survey_responses"."assignment_id") AND (("sc"."created_by" = "auth"."uid"()) OR ("sa"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view surveys assigned to them" ON "public"."surveys" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."survey_assignments"
  WHERE (("survey_assignments"."survey_id" = "surveys"."id") AND ("survey_assignments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their notifications" ON "public"."okr_notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own achievement progress" ON "public"."achievement_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own achievements" ON "public"."user_achievements" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own objectives" ON "public"."objectives" FOR SELECT USING (("auth"."uid"() = "owner_id"));



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



CREATE POLICY "admin_view_objectives" ON "public"."objectives" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."analysis_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_cron_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_instances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "department_visibility_objectives" ON "public"."objectives" FOR SELECT USING ((("visibility" = 'department'::"public"."okr_visibility") AND (EXISTS ( SELECT 1
   FROM ("public"."sbus" "s"
     JOIN "public"."user_sbus" "us" ON (("us"."sbu_id" = "s"."id")))
  WHERE (("s"."id" = "objectives"."sbu_id") AND ("us"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."email_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employment_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "granted_permissions_objectives" ON "public"."objectives" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."okr_permissions"
  WHERE (("okr_permissions"."objective_id" = "objectives"."id") AND (("auth"."uid"() = ANY ("okr_permissions"."user_ids")) OR (EXISTS ( SELECT 1
           FROM "public"."user_sbus" "us"
          WHERE (("us"."user_id" = "auth"."uid"()) AND ("us"."sbu_id" = ANY ("okr_permissions"."sbu_ids"))))) OR (EXISTS ( SELECT 1
           FROM "public"."profiles" "p"
          WHERE (("p"."id" = "auth"."uid"()) AND ("p"."employee_role_id" = ANY ("okr_permissions"."employee_role_ids")))))) AND ("okr_permissions"."can_view" = true)))));



ALTER TABLE "public"."issue_board_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_downvotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issue_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."key_results" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."objectives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_alignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_check_ins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_cycles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."okr_role_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "okr_role_settings_admin_policy" ON "public"."okr_role_settings" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "organization_visibility_objectives" ON "public"."objectives" FOR SELECT USING (("visibility" = 'organization'::"public"."okr_visibility"));



CREATE POLICY "own_view_objectives" ON "public"."objectives" FOR SELECT USING (("owner_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_issues_policy" ON "public"."issues" FOR SELECT USING (true);



ALTER TABLE "public"."sbus" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shared_presentations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "supervisor_view_objectives" ON "public"."objectives" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_supervisors"
  WHERE (("user_supervisors"."supervisor_id" = "auth"."uid"()) AND ("user_supervisors"."user_id" = "objectives"."owner_id")))));



ALTER TABLE "public"."survey_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."survey_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surveys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_visibility_objectives" ON "public"."objectives" FOR SELECT USING ((("visibility" = 'team'::"public"."okr_visibility") AND (EXISTS ( SELECT 1
   FROM ("public"."user_sbus" "us1"
     JOIN "public"."user_sbus" "us2" ON (("us1"."sbu_id" = "us2"."sbu_id")))
  WHERE (("us1"."user_id" = "objectives"."owner_id") AND ("us2"."user_id" = "auth"."uid"()))))));



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




















































































































































































GRANT ALL ON FUNCTION "public"."analyze_okr_progress_logs"("p_objective_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_okr_progress_logs"("p_objective_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_okr_progress_logs"("p_objective_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_cascaded_objective_progress"("objective_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_cascaded_objective_progress"("objective_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_cascaded_objective_progress"("objective_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_instance_completion_rate"("instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_key_result_progress"("p_measurement_type" "text", "p_current_value" numeric, "p_start_value" numeric, "p_target_value" numeric, "p_boolean_value" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_key_result_progress"("p_measurement_type" "text", "p_current_value" numeric, "p_start_value" numeric, "p_target_value" numeric, "p_boolean_value" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_key_result_progress"("p_measurement_type" "text", "p_current_value" numeric, "p_start_value" numeric, "p_target_value" numeric, "p_boolean_value" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_objective_progress_for_single_objective"("objective_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_objective_progress_for_single_objective"("objective_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_objective_progress_for_single_objective"("objective_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_progress"("p_measurement_type" "text", "p_current_value" double precision, "p_start_value" double precision, "p_target_value" double precision, "p_boolean_value" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_progress"("p_measurement_type" "text", "p_current_value" double precision, "p_start_value" double precision, "p_target_value" double precision, "p_boolean_value" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_progress"("p_measurement_type" "text", "p_current_value" double precision, "p_start_value" double precision, "p_target_value" double precision, "p_boolean_value" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_alignment"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_alignment_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_key_result"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_objective"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_objective"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_objective"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_objective_alignment"("p_user_id" "uuid", "p_source_objective_id" "uuid", "p_aligned_objective_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_objective_by_visibility"("p_user_id" "uuid", "p_visibility" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_award_achievements"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_objective_owner_permission"("p_user_id" "uuid", "p_objective_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_objective_owner_permission"("p_user_id" "uuid", "p_objective_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_objective_owner_permission"("p_user_id" "uuid", "p_objective_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_okr_create_permission"("p_user_id" "uuid", "p_permission_type" "text", "p_visibility" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_okr_objective_access"("p_user_id" "uuid", "p_objective_id" "uuid", "p_access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_okr_objective_access"("p_user_id" "uuid", "p_objective_id" "uuid", "p_access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_okr_objective_access"("p_user_id" "uuid", "p_objective_id" "uuid", "p_access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_board_access"("p_user_id" "uuid", "p_board_id" "uuid", "p_access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_next_campaign_instance"("p_campaign_id" "uuid") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."drop_and_recreate_question_responses_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."drop_and_recreate_question_responses_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."drop_and_recreate_question_responses_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_all_instance_completion_rates"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone, "p_start_date_max" timestamp with time zone, "p_end_date_min" timestamp with time zone, "p_end_date_max" timestamp with time zone, "p_status" "text"[], "p_sort_by" "text", "p_sort_direction" "text", "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone, "p_start_date_max" timestamp with time zone, "p_end_date_min" timestamp with time zone, "p_end_date_max" timestamp with time zone, "p_status" "text"[], "p_sort_by" "text", "p_sort_direction" "text", "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_instances"("p_campaign_id" "uuid", "p_start_date_min" timestamp with time zone, "p_start_date_max" timestamp with time zone, "p_end_date_min" timestamp with time zone, "p_end_date_max" timestamp with time zone, "p_status" "text"[], "p_sort_by" "text", "p_sort_direction" "text", "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_sbu_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_supervisor_performance"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dimension_bool"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dimension_bool"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dimension_bool"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dimension_nps"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dimension_nps"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dimension_nps"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dimension_satisfaction"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dimension_satisfaction"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dimension_satisfaction"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text", "p_dimension" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_instance_analysis_data"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_instance_assignment_status"("p_assignment_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_instance_question_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_survey_assignments"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_paginated_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_status" "text", "p_search_term" "text", "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_paginated_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_status" "text", "p_search_term" "text", "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_paginated_campaign_assignments"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_status" "text", "p_search_term" "text", "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text", "p_page" integer, "p_page_size" integer, "p_sort_by" "text", "p_sort_direction" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text", "p_page" integer, "p_page_size" integer, "p_sort_by" "text", "p_sort_direction" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_paginated_campaign_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_search_term" "text", "p_page" integer, "p_page_size" integer, "p_sort_by" "text", "p_sort_direction" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_surveys_count"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_survey_responses"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_survey_responses_for_export"("p_campaign_id" "uuid", "p_instance_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_text_analysis"("p_campaign_id" "uuid", "p_instance_id" "uuid", "p_question_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_alignment_delete_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_alignment_delete_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_alignment_delete_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_instance_activation"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_instance_completion"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_instance_completion"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_instance_completion"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_key_result_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_key_result_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_key_result_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_key_result_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_key_result_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_key_result_deletion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_kr_delete_cascaded_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_kr_delete_cascaded_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_kr_delete_cascaded_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_live_session_questions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_objective_cascade_to_parent"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_objective_cascade_to_parent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_objective_cascade_to_parent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_objective_delete_alignments"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_objective_delete_alignments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_objective_delete_alignments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_objective_delete_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_objective_delete_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_objective_delete_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_objective_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_objective_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_objective_deletion"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."manage_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_cron_schedule" "text", "p_is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."manage_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_cron_schedule" "text", "p_is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_cron_schedule" "text", "p_is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_duplicate_responses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_modifying_submitted_responses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."propagate_alignment_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."propagate_alignment_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."propagate_alignment_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."recalculate_all_cascaded_objective_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."recalculate_all_cascaded_objective_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalculate_all_cascaded_objective_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."recalculate_all_objective_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."recalculate_all_objective_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalculate_all_objective_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_questions"("p_session_id" "uuid", "p_question_id" "uuid", "p_old_order" integer, "p_new_order" integer, "p_direction" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."run_instance_job_now"("p_campaign_id" "uuid", "p_job_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."run_instance_job_now"("p_campaign_id" "uuid", "p_job_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_instance_job_now"("p_campaign_id" "uuid", "p_job_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_live_sessions"("search_text" "text", "status_filters" "text"[], "created_by_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_objectives"("p_search_text" "text", "p_status_filters" "text"[], "p_visibility_filters" "text"[], "p_cycle_id" "uuid", "p_sbu_id" "uuid", "p_is_admin" boolean, "p_user_id" "uuid", "p_page_number" integer, "p_page_size" integer, "p_sort_column" "text", "p_sort_direction" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_objectives"("p_search_text" "text", "p_status_filters" "text"[], "p_visibility_filters" "text"[], "p_cycle_id" "uuid", "p_sbu_id" "uuid", "p_is_admin" boolean, "p_user_id" "uuid", "p_page_number" integer, "p_page_size" integer, "p_sort_column" "text", "p_sort_direction" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_objectives"("p_search_text" "text", "p_status_filters" "text"[], "p_visibility_filters" "text"[], "p_cycle_id" "uuid", "p_sbu_id" "uuid", "p_is_admin" boolean, "p_user_id" "uuid", "p_page_number" integer, "p_page_size" integer, "p_sort_column" "text", "p_sort_direction" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_users"("search_text" "text", "page_number" integer, "page_size" integer, "sbu_filter" "uuid", "level_filter" "uuid", "location_filter" "uuid", "employment_type_filter" "uuid", "employee_role_filter" "uuid", "employee_type_filter" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_instance_cron_job"("p_campaign_id" "uuid", "p_job_type" "text", "p_is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_completion_rate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_instance"("p_instance_id" "uuid", "p_new_starts_at" timestamp with time zone, "p_new_ends_at" timestamp with time zone, "p_new_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_instance"("p_instance_id" "uuid", "p_new_starts_at" timestamp with time zone, "p_new_ends_at" timestamp with time zone, "p_new_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_instance"("p_instance_id" "uuid", "p_new_starts_at" timestamp with time zone, "p_new_ends_at" timestamp with time zone, "p_new_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cascaded_objective_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cascaded_objective_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cascaded_objective_progress"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."validate_kr_values"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_kr_values"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_kr_values"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_kr_values_old"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_kr_values_old"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_kr_values_old"() TO "service_role";
























GRANT ALL ON TABLE "public"."achievement_progress" TO "anon";
GRANT ALL ON TABLE "public"."achievement_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_progress" TO "service_role";



GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_prompts" TO "anon";
GRANT ALL ON TABLE "public"."analysis_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_prompts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE ON TABLE "public"."campaign_cron_jobs" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE ON TABLE "public"."campaign_cron_jobs" TO "authenticated";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE ON TABLE "public"."campaign_cron_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "anon";
GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_instance_status_logs" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_instances" TO "anon";
GRANT ALL ON TABLE "public"."campaign_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_instances" TO "service_role";



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



GRANT ALL ON TABLE "public"."key_results" TO "anon";
GRANT ALL ON TABLE "public"."key_results" TO "authenticated";
GRANT ALL ON TABLE "public"."key_results" TO "service_role";



GRANT ALL ON TABLE "public"."objectives" TO "anon";
GRANT ALL ON TABLE "public"."objectives" TO "authenticated";
GRANT ALL ON TABLE "public"."objectives" TO "service_role";



GRANT ALL ON TABLE "public"."okr_check_ins" TO "anon";
GRANT ALL ON TABLE "public"."okr_check_ins" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_check_ins" TO "service_role";



GRANT ALL ON TABLE "public"."okr_comments" TO "anon";
GRANT ALL ON TABLE "public"."okr_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_comments" TO "service_role";



GRANT ALL ON TABLE "public"."okr_cycles" TO "anon";
GRANT ALL ON TABLE "public"."okr_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_cycles" TO "service_role";



GRANT ALL ON TABLE "public"."key_result_statistics" TO "anon";
GRANT ALL ON TABLE "public"."key_result_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."key_result_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."live_session_participants" TO "anon";
GRANT ALL ON TABLE "public"."live_session_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."live_session_participants" TO "service_role";



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



GRANT ALL ON TABLE "public"."okr_alignments" TO "anon";
GRANT ALL ON TABLE "public"."okr_alignments" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_alignments" TO "service_role";



GRANT ALL ON TABLE "public"."objective_statistics" TO "anon";
GRANT ALL ON TABLE "public"."objective_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."objective_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."okr_default_settings" TO "anon";
GRANT ALL ON TABLE "public"."okr_default_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_default_settings" TO "service_role";



GRANT ALL ON TABLE "public"."okr_history" TO "anon";
GRANT ALL ON TABLE "public"."okr_history" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_history" TO "service_role";



GRANT ALL ON TABLE "public"."okr_notifications" TO "anon";
GRANT ALL ON TABLE "public"."okr_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."okr_permissions" TO "anon";
GRANT ALL ON TABLE "public"."okr_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."okr_progress_calculation_lock" TO "anon";
GRANT ALL ON TABLE "public"."okr_progress_calculation_lock" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_progress_calculation_lock" TO "service_role";



GRANT ALL ON TABLE "public"."okr_role_settings" TO "anon";
GRANT ALL ON TABLE "public"."okr_role_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."okr_role_settings" TO "service_role";



GRANT ALL ON TABLE "public"."survey_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."survey_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."recent_activities" TO "anon";
GRANT ALL ON TABLE "public"."recent_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_activities" TO "service_role";



GRANT ALL ON TABLE "public"."response_trends" TO "anon";
GRANT ALL ON TABLE "public"."response_trends" TO "authenticated";
GRANT ALL ON TABLE "public"."response_trends" TO "service_role";



GRANT ALL ON TABLE "public"."shared_presentations" TO "anon";
GRANT ALL ON TABLE "public"."shared_presentations" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_presentations" TO "service_role";



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
