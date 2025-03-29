
-- This SQL script modifies how objective progress is calculated
-- to ensure child objectives contribute exactly their weight percentage to parent progress

-- Create or replace the function with the fixed calculation logic
CREATE OR REPLACE FUNCTION public.calculate_cascaded_objective_progress(p_objective_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_total_kr_weight NUMERIC := 0;
    v_weighted_kr_progress NUMERIC := 0;
    v_total_child_weight NUMERIC := 0;
    v_weighted_child_progress NUMERIC := 0;
    v_old_progress NUMERIC;
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
    
    -- Get current objective progress and parent ID
    SELECT progress, parent_objective_id INTO v_old_progress, v_parent_objective_id
    FROM objectives
    WHERE id = p_objective_id;
    
    BEGIN
        -- Step 1: Calculate progress from key results
        SELECT 
            COALESCE(SUM(weight), 0),
            COALESCE(SUM(progress * weight / 100), 0)
        INTO
            v_total_kr_weight,
            v_weighted_kr_progress
        FROM
            key_results kr
        WHERE
            kr.objective_id = calculate_cascaded_objective_progress.p_objective_id;
        
        -- Step 2: Calculate progress from aligned child objectives using alignment weights
        SELECT 
            COALESCE(SUM(a.weight), 0),
            COALESCE(SUM(o.progress * a.weight / 100), 0)
        INTO
            v_total_child_weight,
            v_weighted_child_progress
        FROM
            okr_alignments a
            JOIN objectives o ON o.id = a.aligned_objective_id
        WHERE
            a.source_objective_id = p_objective_id
            AND a.alignment_type = 'parent_child';
        
        -- Log the calculation for debugging
        INSERT INTO okr_history (
            entity_id,
            entity_type,
            change_type,
            changed_by,
            new_data
        ) VALUES (
            p_objective_id,
            'objective_progress_calculation',
            'fixed_weighted_calculation',
            auth.uid(),
            jsonb_build_object(
                'kr_weight_sum', v_total_kr_weight,
                'kr_weighted_progress', v_weighted_kr_progress,
                'child_weight_sum', v_total_child_weight,
                'child_weighted_progress', v_weighted_child_progress
            )
        );
        
        -- Calculate combined progress - key change: sum the weighted contributions directly
        v_combined_progress := v_weighted_kr_progress + v_weighted_child_progress;
        
        -- Cap the progress at 100%
        v_new_progress := LEAST(100, ROUND(v_combined_progress::NUMERIC, 2));
        
        -- Update the objective progress
        UPDATE objectives
        SET 
            progress = v_new_progress,
            updated_at = NOW()
        WHERE id = p_objective_id;
        
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
        -- Release the lock in case of error
        UPDATE okr_progress_calculation_lock
        SET locked = FALSE, updated_at = NOW()
        WHERE objective_id = p_objective_id;
        
        -- Continue without failing
        RAISE WARNING 'Error calculating cascaded progress for objective %: %', p_objective_id, SQLERRM;
    END;
END;
$function$;

-- Add a trigger to ensure the new calculation is used
DROP TRIGGER IF EXISTS cascade_kr_progress_update ON key_results;
CREATE TRIGGER cascade_kr_progress_update
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION update_cascaded_objective_progress();

DROP TRIGGER IF EXISTS cascade_kr_delete_progress ON key_results;
CREATE TRIGGER cascade_kr_delete_progress
AFTER DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION handle_kr_delete_cascaded_progress();

-- Also ensure parent-child updates trigger recalculation
DROP TRIGGER IF EXISTS cascade_objective_to_parent ON objectives;
CREATE TRIGGER cascade_objective_to_parent
AFTER UPDATE ON objectives
FOR EACH ROW EXECUTE FUNCTION handle_objective_cascade_to_parent();

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
    'fixed_objective_progress_calculation',
    auth.uid(),
    jsonb_build_object(
        'description', 'Modified objective progress calculation to make child objectives contribute exactly their weight percentage to parent progress',
        'timestamp', now()
    )
);

-- Recalculate all objective progress with the new logic
SELECT recalculate_all_objective_progress();
