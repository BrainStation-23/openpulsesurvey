
-- First, let's drop the triggers that might be causing conflicts
DROP TRIGGER IF EXISTS calculate_objective_progress_trigger ON key_results;
DROP TRIGGER IF EXISTS update_objective_progress_trigger ON key_results;

-- Enhance the calculate_objective_progress function with better logging
CREATE OR REPLACE FUNCTION public.calculate_objective_progress()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_total_weight NUMERIC := 0;
    v_weighted_progress NUMERIC := 0;
    v_objective_id UUID;
    v_error_message TEXT;
    v_old_progress NUMERIC;
BEGIN
    -- Get the objective ID
    v_objective_id := NEW.objective_id;
    
    -- Get current objective progress for logging
    SELECT progress INTO v_old_progress
    FROM objectives
    WHERE id = v_objective_id;
    
    -- Log the operation for debugging
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        v_objective_id,
        'objective_progress_update',
        'progress_calculation_started',
        NEW.owner_id,
        jsonb_build_object(
            'key_result_id', NEW.id,
            'progress', NEW.progress,
            'weight', NEW.weight,
            'old_objective_progress', v_old_progress,
            'trigger_operation', TG_OP
        )
    );
    
    BEGIN
        -- Calculate the total weight and weighted progress sum
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight), 0)
        INTO
            v_total_weight,
            v_weighted_progress
        FROM
            key_results
        WHERE
            objective_id = v_objective_id;
        
        -- Update the objective progress
        IF v_total_weight = 0 THEN
            UPDATE objectives
            SET progress = 0
            WHERE id = v_objective_id;
            
            -- Log the update
            INSERT INTO okr_history (
                entity_id,
                entity_type,
                change_type,
                changed_by,
                new_data
            ) VALUES (
                v_objective_id,
                'objective_progress_update',
                'progress_updated_zero_weight',
                NEW.owner_id,
                jsonb_build_object(
                    'key_result_id', NEW.id,
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
                WHERE id = v_objective_id;
                
                -- Log the update
                INSERT INTO okr_history (
                    entity_id,
                    entity_type,
                    change_type,
                    changed_by,
                    new_data
                ) VALUES (
                    v_objective_id,
                    'objective_progress_update',
                    'progress_updated_success',
                    NEW.owner_id,
                    jsonb_build_object(
                        'key_result_id', NEW.id,
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
            v_objective_id,
            'objective_progress_error',
            'calculation_error',
            NEW.owner_id,
            jsonb_build_object(
                'error', v_error_message,
                'key_result_id', NEW.id
            )
        );
        
        -- Continue without failing
        RAISE WARNING 'Error calculating objective progress: %', v_error_message;
    END;
    
    RETURN NEW;
END;
$function$;

-- Enhanced update_objective_progress function for DELETE operations
CREATE OR REPLACE FUNCTION public.update_objective_progress()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_total_weight NUMERIC := 0;
    v_weighted_progress NUMERIC := 0;
    v_objective_id UUID;
    v_error_message TEXT;
    v_old_progress NUMERIC;
BEGIN
    -- Get the objective ID from the deleted row
    v_objective_id := OLD.objective_id;
    
    -- Get current objective progress for logging
    SELECT progress INTO v_old_progress
    FROM objectives
    WHERE id = v_objective_id;
    
    -- Log the operation
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        previous_data
    ) VALUES (
        v_objective_id,
        'objective_progress_update',
        'key_result_deleted',
        OLD.owner_id,
        jsonb_build_object(
            'key_result_id', OLD.id,
            'progress', OLD.progress,
            'weight', OLD.weight,
            'old_objective_progress', v_old_progress
        )
    );
    
    BEGIN
        -- Calculate the total weight and weighted progress sum for remaining key results
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight), 0)
        INTO
            v_total_weight,
            v_weighted_progress
        FROM
            key_results
        WHERE
            objective_id = v_objective_id;
        
        -- Update the objective progress
        IF v_total_weight = 0 THEN
            UPDATE objectives
            SET progress = 0
            WHERE id = v_objective_id;
            
            -- Log the update
            INSERT INTO okr_history (
                entity_id,
                entity_type,
                change_type,
                changed_by,
                new_data
            ) VALUES (
                v_objective_id,
                'objective_progress_update',
                'progress_updated_zero_weight_after_delete',
                OLD.owner_id,
                jsonb_build_object(
                    'key_result_id', OLD.id,
                    'new_progress', 0
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
                WHERE id = v_objective_id;
                
                -- Log the update
                INSERT INTO okr_history (
                    entity_id,
                    entity_type,
                    change_type,
                    changed_by,
                    new_data
                ) VALUES (
                    v_objective_id,
                    'objective_progress_update',
                    'progress_updated_success_after_delete',
                    OLD.owner_id,
                    jsonb_build_object(
                        'key_result_id', OLD.id,
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
            v_objective_id,
            'objective_progress_error',
            'calculation_error_after_delete',
            OLD.owner_id,
            jsonb_build_object(
                'error', v_error_message,
                'key_result_id', OLD.id
            )
        );
        
        -- Continue without failing
        RAISE WARNING 'Error updating objective progress after deletion: %', v_error_message;
    END;
    
    RETURN OLD;
END;
$function$;

-- Now recreate the triggers with AFTER timing to ensure they run after the validate_kr_values trigger
CREATE TRIGGER calculate_objective_progress_trigger
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION calculate_objective_progress();

CREATE TRIGGER update_objective_progress_trigger
AFTER DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION update_objective_progress();

-- Run a one-time recalculation of all objectives to ensure they're up to date
SELECT recalculate_all_objective_progress();

-- Create a function to analyze the okr_history for debugging
CREATE OR REPLACE FUNCTION public.analyze_okr_progress_logs(
  p_objective_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  event_time timestamp with time zone,
  entity_id uuid,
  entity_type text,
  change_type text,
  details jsonb
)
LANGUAGE plpgsql
AS $function$
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
$function$;
