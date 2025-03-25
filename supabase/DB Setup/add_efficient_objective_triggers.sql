
-- Create a focused function to calculate progress for a single objective
CREATE OR REPLACE FUNCTION public.calculate_objective_progress_for_single_objective(objective_id uuid)
RETURNS void
LANGUAGE plpgsql
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
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight), 0)
        INTO
            v_total_weight,
            v_weighted_progress
        FROM
            key_results
        WHERE
            objective_id = objective_id;
        
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

-- Create single objective trigger function for INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.calculate_objective_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only recalculate for the specific objective that owns this key result
    PERFORM calculate_objective_progress_for_single_objective(NEW.objective_id);
    RETURN NEW;
END;
$$;

-- Create single objective trigger function for DELETE
CREATE OR REPLACE FUNCTION public.update_objective_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only recalculate for the specific objective that owned this key result
    PERFORM calculate_objective_progress_for_single_objective(OLD.objective_id);
    RETURN OLD;
END;
$$;

-- Add triggers
CREATE TRIGGER calculate_objective_progress_trigger
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW
EXECUTE FUNCTION calculate_objective_progress();

CREATE TRIGGER update_objective_progress_trigger
AFTER DELETE ON key_results
FOR EACH ROW
EXECUTE FUNCTION update_objective_progress();
