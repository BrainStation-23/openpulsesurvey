
-- This SQL script fixes trigger functions for objective progress calculation
-- when key results are added, updated or deleted

-- First, drop the existing triggers that might be causing conflicts
DROP TRIGGER IF EXISTS calculate_objective_progress_trigger ON key_results;
DROP TRIGGER IF EXISTS update_objective_progress_trigger ON key_results;

-- Create a temporary table to track which objectives need progress recalculation
CREATE TABLE IF NOT EXISTS temp_objectives_to_update (
  objective_id UUID PRIMARY KEY
);

-- Create a unified trigger function to handle all key result changes
CREATE OR REPLACE FUNCTION public.handle_key_result_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_objective_id UUID;
BEGIN
  -- For deletes, use OLD values
  IF TG_OP = 'DELETE' THEN
    v_objective_id := OLD.objective_id;

    -- Track this objective for update
    INSERT INTO temp_objectives_to_update (objective_id)
    VALUES (v_objective_id)
    ON CONFLICT (objective_id) DO NOTHING;

    -- Log the operation
    INSERT INTO okr_history (
      entity_id,
      entity_type,
      change_type,
      changed_by,
      previous_data
    ) VALUES (
      v_objective_id,
      'objective_kr_trigger',
      'key_result_deleted',
      auth.uid(),
      jsonb_build_object(
        'key_result_id', OLD.id,
        'key_result_title', OLD.title,
        'key_result_progress', OLD.progress
      )
    );
    
    RETURN OLD;
  ELSE
    -- For inserts and updates, use NEW values
    v_objective_id := NEW.objective_id;
    
    -- Track this objective for update
    INSERT INTO temp_objectives_to_update (objective_id)
    VALUES (v_objective_id)
    ON CONFLICT (objective_id) DO NOTHING;

    -- Log the operation
    INSERT INTO okr_history (
      entity_id,
      entity_type,
      change_type,
      changed_by,
      new_data
    ) VALUES (
      v_objective_id,
      'objective_kr_trigger',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'key_result_created'
        ELSE 'key_result_updated'
      END,
      auth.uid(),
      jsonb_build_object(
        'key_result_id', NEW.id,
        'key_result_title', NEW.title,
        'key_result_progress', NEW.progress,
        'operation', TG_OP
      )
    );
    
    RETURN NEW;
  END IF;
END;
$$;

-- Create a function to process all queued objective updates
CREATE OR REPLACE FUNCTION public.process_queued_objective_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_objective_id UUID;
BEGIN
  -- Process each queued objective
  FOR v_objective_id IN SELECT objective_id FROM temp_objectives_to_update
  LOOP
    -- Calculate progress for this objective
    PERFORM calculate_cascaded_objective_progress(v_objective_id);
    
    -- Log the process
    INSERT INTO okr_history (
      entity_id,
      entity_type,
      change_type,
      changed_by,
      new_data
    ) VALUES (
      v_objective_id,
      'objective_progress_update',
      'queue_processed',
      auth.uid(),
      jsonb_build_object(
        'timestamp', now()
      )
    );
  END LOOP;
  
  -- Clear the queue
  DELETE FROM temp_objectives_to_update;
  
  RETURN NULL;
END;
$$;

-- Create the triggers
CREATE TRIGGER track_key_result_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION handle_key_result_changes();

CREATE TRIGGER process_objective_updates_trigger
AFTER INSERT OR UPDATE OR DELETE ON key_results
FOR STATEMENT EXECUTE FUNCTION process_queued_objective_updates();

-- Now update the cascaded objective progress calculation function to handle empty objectives correctly
CREATE OR REPLACE FUNCTION public.calculate_cascaded_objective_progress(p_objective_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_kr_weight NUMERIC := 0;
    v_weighted_kr_progress NUMERIC := 0;
    v_total_child_weight NUMERIC := 0;
    v_weighted_child_progress NUMERIC := 0;
    v_old_progress NUMERIC;
    v_kr_weight_sum NUMERIC;
    v_child_weight_sum NUMERIC;
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
            COALESCE(SUM(1), 0),
            COALESCE(SUM(o.progress), 0)
        INTO
            v_total_child_weight,
            v_weighted_child_progress
        FROM
            objectives o
        WHERE
            o.parent_objective_id = p_objective_id;
        
        -- Calculate total weights and combined progress
        v_kr_weight_sum := v_total_kr_weight;
        v_child_weight_sum := v_total_child_weight;
        
        -- Fixed calculation logic to properly handle cases where only child objectives exist
        -- or only key results exist, or both exist
        IF v_kr_weight_sum > 0 AND v_child_weight_sum > 0 THEN
            -- If both KRs and children exist, weight them 50-50
            v_combined_progress := 
                (v_weighted_kr_progress / v_kr_weight_sum) * 0.5 + 
                (v_weighted_child_progress / v_child_weight_sum) * 0.5;
        ELSIF v_kr_weight_sum > 0 THEN
            -- If only KRs exist, use only their progress
            v_combined_progress := v_weighted_kr_progress / v_kr_weight_sum;
        ELSIF v_child_weight_sum > 0 THEN
            -- If only child objectives exist, use only their progress
            v_combined_progress := v_weighted_child_progress / v_child_weight_sum;
        ELSE
            -- No KRs or children - set progress to 0
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
        
        -- Release the lock
        UPDATE okr_progress_calculation_lock
        SET locked = FALSE, updated_at = NOW()
        WHERE objective_id = p_objective_id;
        
        -- Log the update
        INSERT INTO okr_history (
            entity_id,
            entity_type,
            change_type,
            changed_by,
            new_data
        ) VALUES (
            p_objective_id,
            'objective_progress_update',
            'progress_calculated',
            auth.uid(),
            jsonb_build_object(
                'old_progress', v_old_progress,
                'new_progress', v_new_progress,
                'kr_progress', v_weighted_kr_progress,
                'kr_weight', v_total_kr_weight,
                'child_progress', v_weighted_child_progress,
                'child_weight', v_total_child_weight
            )
        );
        
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
        
        -- Log the error
        INSERT INTO okr_history (
            entity_id,
            entity_type,
            change_type,
            changed_by,
            previous_data
        ) VALUES (
            p_objective_id,
            'objective_progress_error',
            'calculation_error',
            auth.uid(),
            jsonb_build_object(
                'error', SQLERRM,
                'context', 'cascaded_calculation'
            )
        );
        
        -- Continue without failing
        RAISE WARNING 'Error calculating cascaded progress for objective %: %', p_objective_id, SQLERRM;
    END;
END;
$$;

-- Create a function to recalculate all cascaded objective progress
CREATE OR REPLACE FUNCTION public.recalculate_all_cascaded_objective_progress()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_objective RECORD;
BEGIN
    -- Clean up any locks first
    DELETE FROM okr_progress_calculation_lock;
    
    -- First recalculate all leaf objectives (those without children)
    FOR v_objective IN 
        SELECT o.id 
        FROM objectives o
        LEFT JOIN objectives child ON child.parent_objective_id = o.id
        WHERE child.id IS NULL
        ORDER BY o.id
    LOOP
        PERFORM calculate_cascaded_objective_progress(v_objective.id);
    END LOOP;
    
    -- Then recalculate any remaining objectives
    FOR v_objective IN 
        SELECT o.id 
        FROM objectives o
        LEFT JOIN objectives child ON child.parent_objective_id = o.id
        WHERE child.id IS NOT NULL
        ORDER BY o.id
    LOOP
        PERFORM calculate_cascaded_objective_progress(v_objective.id);
    END LOOP;
END;
$$;

-- Create a function to recalculate a single objective's progress
CREATE OR REPLACE FUNCTION public.recalculate_objective_progress(p_objective_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clean up any locks for this objective
    DELETE FROM okr_progress_calculation_lock 
    WHERE objective_id = p_objective_id;
    
    -- Then recalculate the progress
    PERFORM calculate_cascaded_objective_progress(p_objective_id);
END;
$$;

-- Run a one-time recalculation to ensure everything is up to date
SELECT recalculate_all_cascaded_objective_progress();

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
    'key_result_triggers_fixed',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Fixed key result triggers to properly handle deletion and cascading progress updates',
        'timestamp', now()
    )
);
