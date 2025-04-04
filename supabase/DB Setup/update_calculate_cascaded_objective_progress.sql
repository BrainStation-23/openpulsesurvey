
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.calculate_cascaded_objective_progress;

-- Create the updated function that supports both calculation methods
CREATE OR REPLACE FUNCTION public.calculate_cascaded_objective_progress(objective_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_progress NUMERIC;
    v_calculation_method VARCHAR(20);
    v_objective_has_key_results BOOLEAN;
    v_objective_has_children BOOLEAN;
    v_lock_exists BOOLEAN;
BEGIN
    -- Check if there's a lock for this objective
    SELECT EXISTS (
        SELECT 1 FROM okr_progress_calculation_lock
        WHERE objective_id = calculate_cascaded_objective_progress.objective_id
        AND locked = TRUE
    ) INTO v_lock_exists;
    
    -- If locked, exit
    IF v_lock_exists THEN
        RETURN;
    END IF;
    
    -- Create a lock
    INSERT INTO okr_progress_calculation_lock (objective_id, locked)
    VALUES (objective_id, TRUE)
    ON CONFLICT (objective_id) DO UPDATE SET locked = TRUE;
    
    -- Get the calculation method for this objective
    SELECT progress_calculation_method INTO v_calculation_method
    FROM objectives
    WHERE id = objective_id;
    
    -- Default to weighted_sum if not set
    IF v_calculation_method IS NULL THEN
        v_calculation_method := 'weighted_sum';
    END IF;
    
    -- Check if the objective has key results
    SELECT EXISTS (
        SELECT 1 FROM key_results
        WHERE objective_id = calculate_cascaded_objective_progress.objective_id
    ) INTO v_objective_has_key_results;
    
    -- Check if the objective has child objectives
    SELECT EXISTS (
        SELECT 1 FROM objectives
        WHERE parent_objective_id = calculate_cascaded_objective_progress.objective_id
    ) INTO v_objective_has_children;
    
    -- If neither key results nor child objectives, keep progress as is
    IF NOT v_objective_has_key_results AND NOT v_objective_has_children THEN
        -- Release lock
        UPDATE okr_progress_calculation_lock
        SET locked = FALSE
        WHERE objective_id = calculate_cascaded_objective_progress.objective_id;
        RETURN;
    END IF;
    
    -- Calculate progress based on key results if they exist
    IF v_objective_has_key_results THEN
        -- Different calculation logic based on method
        IF v_calculation_method = 'weighted_sum' THEN
            -- Weighted Sum: Sum(progress * weight) / Sum(weight)
            SELECT COALESCE(
                SUM(progress * weight) / NULLIF(SUM(weight), 0),
                0
            ) INTO v_progress
            FROM key_results
            WHERE objective_id = calculate_cascaded_objective_progress.objective_id;
        ELSE -- weighted_avg
            -- Weighted Average: Average of (progress * weight) values
            SELECT COALESCE(
                AVG(progress * weight),
                0
            ) INTO v_progress
            FROM key_results
            WHERE objective_id = calculate_cascaded_objective_progress.objective_id;
        END IF;
    ELSIF v_objective_has_children THEN
        -- Calculate based on child objectives if they exist
        IF v_calculation_method = 'weighted_sum' THEN
            -- For parent objectives with children, calculate based on children's progress
            -- First ensure all children have their progress calculated
            FOR child_id IN 
                SELECT id FROM objectives 
                WHERE parent_objective_id = calculate_cascaded_objective_progress.objective_id
            LOOP
                -- Recursively update each child's progress
                PERFORM calculate_cascaded_objective_progress(child_id);
            END LOOP;
            
            -- Now calculate progress as a simple average of children
            SELECT COALESCE(AVG(progress), 0) INTO v_progress
            FROM objectives
            WHERE parent_objective_id = calculate_cascaded_objective_progress.objective_id;
        ELSE -- weighted_avg
            -- First ensure all children have their progress calculated
            FOR child_id IN 
                SELECT id FROM objectives 
                WHERE parent_objective_id = calculate_cascaded_objective_progress.objective_id
            LOOP
                -- Recursively update each child's progress
                PERFORM calculate_cascaded_objective_progress(child_id);
            END LOOP;
            
            -- Calculate as average of children's progress
            SELECT COALESCE(AVG(progress), 0) INTO v_progress
            FROM objectives
            WHERE parent_objective_id = calculate_cascaded_objective_progress.objective_id;
        END IF;
    END IF;
    
    -- Update the objective's progress
    UPDATE objectives
    SET 
        progress = v_progress,
        status = CASE
            WHEN v_progress = 100 THEN 'completed'::objective_status
            WHEN v_progress > 0 AND status = 'draft' THEN 'in_progress'::objective_status
            ELSE status
        END
    WHERE id = objective_id;
    
    -- Log the progress calculation in history
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        objective_id,
        'objective',
        'progress_calculation',
        '00000000-0000-0000-0000-000000000000',
        jsonb_build_object(
            'progress', v_progress,
            'calculation_method', v_calculation_method,
            'has_key_results', v_objective_has_key_results,
            'has_children', v_objective_has_children
        )
    );
    
    -- Release lock
    UPDATE okr_progress_calculation_lock
    SET locked = FALSE
    WHERE objective_id = calculate_cascaded_objective_progress.objective_id;
    
    -- Update parent objective progress if this objective has a parent
    DECLARE
        parent_id UUID;
    BEGIN
        SELECT parent_objective_id INTO parent_id
        FROM objectives
        WHERE id = objective_id;
        
        IF parent_id IS NOT NULL THEN
            PERFORM calculate_cascaded_objective_progress(parent_id);
        END IF;
    END;
END;
$$;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.calculate_cascaded_objective_progress IS 
'Calculates the progress of an objective based on its configuration (weighted_sum or weighted_avg).
If the objective has key results, it calculates progress based on them.
If the objective has child objectives, it calculates progress based on the children.
The function also updates the status based on progress and propagates changes up the hierarchy.';

-- Create or update recalculate_all_objective_progress function to use the new calculation method
DROP FUNCTION IF EXISTS public.recalculate_all_objective_progress;
CREATE OR REPLACE FUNCTION public.recalculate_all_objective_progress()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    obj_id UUID;
    count INTEGER := 0;
BEGIN
    -- First, clear all locks to prevent issues
    DELETE FROM okr_progress_calculation_lock;
    
    -- Start with root objectives (those without parents)
    FOR obj_id IN 
        SELECT id FROM objectives 
        WHERE parent_objective_id IS NULL
    LOOP
        PERFORM calculate_cascaded_objective_progress(obj_id);
        count := count + 1;
    END LOOP;
    
    RETURN count;
END;
$$;

COMMENT ON FUNCTION public.recalculate_all_objective_progress IS 
'Recalculates progress for all objectives in the system, starting with root objectives.';

-- Log this change
INSERT INTO okr_history (
    entity_id, 
    entity_type,
    change_type,
    changed_by,
    new_data
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- System operation
    'system_update',
    'update_progress_calculation',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Updated progress calculation function to support both weighted_sum and weighted_avg methods',
        'timestamp', now()
    )
);
