
-- Create a function to calculate the cascaded progress for an objective
-- This considers both direct key results and child objectives
CREATE OR REPLACE FUNCTION public.calculate_cascaded_objective_progress(p_objective_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_kr_weight NUMERIC := 0;
    v_weighted_kr_progress NUMERIC := 0;
    v_total_child_weight NUMERIC := 0;
    v_weighted_child_progress NUMERIC := 0;
    v_error_message TEXT;
    v_old_progress NUMERIC;
    v_kr_weight_sum NUMERIC;
    v_child_weight_sum NUMERIC;
    v_combined_weight NUMERIC;
    v_combined_progress NUMERIC;
    v_new_progress NUMERIC;
    v_parent_objective_id uuid;
    v_already_processed BOOLEAN := FALSE;
    v_processing_depth INTEGER := 0;
    v_max_processing_depth CONSTANT INTEGER := 10; -- Prevent infinite recursion
BEGIN
    -- Check if we're too deep in recursion to prevent infinite loops
    IF v_processing_depth > v_max_processing_depth THEN
        RAISE WARNING 'Maximum recursion depth reached when calculating progress for objective %', p_objective_id;
        RETURN;
    END IF;
    
    -- Check if this objective is currently being processed to prevent circular references
    SELECT EXISTS (
        SELECT 1 FROM okr_progress_calculation_lock 
        WHERE objective_id = p_objective_id AND locked = TRUE
    ) INTO v_already_processed;
    
    IF v_already_processed THEN
        RAISE WARNING 'Circular reference detected when calculating progress for objective %', p_objective_id;
        RETURN;
    END IF;
    
    -- Lock this objective to prevent circular calculations
    INSERT INTO okr_progress_calculation_lock (objective_id, locked)
    VALUES (p_objective_id, TRUE)
    ON CONFLICT (objective_id) 
    DO UPDATE SET locked = TRUE, updated_at = NOW();
    
    -- Get current objective progress for logging
    SELECT progress, parent_objective_id INTO v_old_progress, v_parent_objective_id
    FROM objectives
    WHERE id = p_objective_id;
    
    -- Log the operation start
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        p_objective_id,
        'objective_cascaded_progress',
        'progress_calculation_started',
        auth.uid(),
        jsonb_build_object(
            'old_objective_progress', v_old_progress,
            'calculation_type', 'cascaded'
        )
    );
    
    BEGIN
        -- Step 1: Calculate progress from key results
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight), 0)
        INTO
            v_total_kr_weight,
            v_weighted_kr_progress
        FROM
            key_results
        WHERE
            objective_id = p_objective_id;
        
        -- Step 2: Calculate progress from child objectives
        SELECT 
            COALESCE(SUM(CASE WHEN a.weight IS NULL THEN 1 ELSE a.weight END), 0),
            COALESCE(SUM(o.progress * CASE WHEN a.weight IS NULL THEN 1 ELSE a.weight END), 0)
        INTO
            v_total_child_weight,
            v_weighted_child_progress
        FROM
            objectives o
        WHERE
            o.parent_objective_id = p_objective_id;
        
        -- Calculate total weights and combined progress
        v_kr_weight_sum := GREATEST(v_total_kr_weight, 0.001); -- Avoid division by zero
        v_child_weight_sum := GREATEST(v_total_child_weight, 0);
        
        -- If there are both KRs and child objectives, weigh them equally by default
        -- Otherwise, use whichever one has data
        IF v_kr_weight_sum > 0 AND v_child_weight_sum > 0 THEN
            -- Both KRs and children contribute 50% each to the objective progress
            v_combined_progress := 
                (v_weighted_kr_progress / v_kr_weight_sum) * 0.5 + 
                (v_weighted_child_progress / v_child_weight_sum) * 0.5;
        ELSIF v_kr_weight_sum > 0 THEN
            -- Only KRs contribute
            v_combined_progress := v_weighted_kr_progress / v_kr_weight_sum;
        ELSIF v_child_weight_sum > 0 THEN
            -- Only child objectives contribute
            v_combined_progress := v_weighted_child_progress / v_child_weight_sum;
        ELSE
            -- No KRs or children
            v_combined_progress := 0;
        END IF;
        
        -- Round to 2 decimal places
        v_new_progress := ROUND(v_combined_progress::NUMERIC, 2);
        
        -- Update the objective progress
        UPDATE objectives
        SET 
            progress = v_new_progress,
            updated_at = NOW()
        WHERE id = p_objective_id;
        
        -- Log the update
        INSERT INTO okr_history (
            entity_id,
            entity_type,
            change_type,
            changed_by,
            new_data
        ) VALUES (
            p_objective_id,
            'objective_cascaded_progress',
            'progress_updated',
            auth.uid(),
            jsonb_build_object(
                'old_progress', v_old_progress,
                'new_progress', v_new_progress,
                'kr_weight_sum', v_kr_weight_sum,
                'child_weight_sum', v_child_weight_sum,
                'kr_contribution', CASE WHEN v_kr_weight_sum > 0 THEN v_weighted_kr_progress / v_kr_weight_sum ELSE 0 END,
                'child_contribution', CASE WHEN v_child_weight_sum > 0 THEN v_weighted_child_progress / v_child_weight_sum ELSE 0 END
            )
        );
        
        -- Release the lock
        UPDATE okr_progress_calculation_lock
        SET locked = FALSE, updated_at = NOW()
        WHERE objective_id = p_objective_id;
        
        -- Recursively update parent objective if exists
        IF v_parent_objective_id IS NOT NULL THEN
            -- Increment depth counter to prevent infinite recursion
            v_processing_depth := v_processing_depth + 1;
            PERFORM calculate_cascaded_objective_progress(v_parent_objective_id);
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
            p_objective_id,
            'objective_cascaded_progress_error',
            'calculation_error',
            auth.uid(),
            jsonb_build_object(
                'error', v_error_message,
                'calculation_type', 'cascaded'
            )
        );
        
        -- Release the lock in case of error
        UPDATE okr_progress_calculation_lock
        SET locked = FALSE, updated_at = NOW()
        WHERE objective_id = p_objective_id;
        
        -- Continue without failing
        RAISE WARNING 'Error calculating cascaded progress for objective %: %', p_objective_id, v_error_message;
    END;
END;
$$;

-- Create table to track objectives being processed to prevent circular references
CREATE TABLE IF NOT EXISTS okr_progress_calculation_lock (
    objective_id UUID PRIMARY KEY,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on the locked column for performance
CREATE INDEX IF NOT EXISTS idx_okr_progress_calculation_lock_locked
ON okr_progress_calculation_lock(locked);

-- Create a function to recursively recalculate all objectives
CREATE OR REPLACE FUNCTION public.recalculate_all_cascaded_objective_progress()
RETURNS void
LANGUAGE plpgsql
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
    
    -- Then process any remaining objectives with children
    FOR v_objective IN 
        SELECT o.id 
        FROM objectives o
        WHERE EXISTS (
            SELECT 1 FROM objectives child 
            WHERE child.parent_objective_id = o.id
        )
        AND EXISTS (
            SELECT 1 FROM okr_progress_calculation_lock
            WHERE objective_id = o.id AND locked = FALSE
        )
        ORDER BY o.id
    LOOP
        PERFORM calculate_cascaded_objective_progress(v_objective.id);
    END LOOP;
    
    -- Log completion
    INSERT INTO okr_history (
        entity_id, 
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        'system_update',
        'recalculated_all_cascaded_progress',
        '00000000-0000-0000-0000-000000000000',
        jsonb_build_object(
            'timestamp', now()
        )
    );
END;
$$;

-- Create trigger function to update cascaded progress when a key result changes
CREATE OR REPLACE FUNCTION public.update_cascaded_objective_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clean up any stale locks
    DELETE FROM okr_progress_calculation_lock
    WHERE updated_at < NOW() - INTERVAL '10 minutes';
    
    -- First update the direct objective progress
    PERFORM calculate_cascaded_objective_progress(NEW.objective_id);
    
    RETURN NEW;
END;
$$;

-- Create trigger function for handling key result deletion
CREATE OR REPLACE FUNCTION public.handle_kr_delete_cascaded_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create trigger function for handling objective changes that should cascade
CREATE OR REPLACE FUNCTION public.handle_objective_cascade_to_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Add triggers
DROP TRIGGER IF EXISTS cascade_kr_progress_update ON key_results;
CREATE TRIGGER cascade_kr_progress_update
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW
EXECUTE FUNCTION update_cascaded_objective_progress();

DROP TRIGGER IF EXISTS cascade_kr_delete_progress ON key_results;
CREATE TRIGGER cascade_kr_delete_progress
AFTER DELETE ON key_results
FOR EACH ROW
EXECUTE FUNCTION handle_kr_delete_cascaded_progress();

DROP TRIGGER IF EXISTS cascade_objective_to_parent ON objectives;
CREATE TRIGGER cascade_objective_to_parent
AFTER UPDATE ON objectives
FOR EACH ROW
EXECUTE FUNCTION handle_objective_cascade_to_parent();

-- Log this database change
INSERT INTO okr_history (
    entity_id, 
    entity_type,
    change_type,
    changed_by,
    new_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_update',
    'implemented_cascaded_progress',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Added cascaded objective progress calculation to propagate changes through the objective hierarchy',
        'timestamp', now()
    )
);

-- Initial calculation of all objectives to start with correct values
SELECT recalculate_all_cascaded_objective_progress();
