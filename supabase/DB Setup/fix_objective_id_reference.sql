
-- Fix the ambiguous column reference in calculate_cascaded_objective_progress

CREATE OR REPLACE FUNCTION public.calculate_cascaded_objective_progress(objective_id UUID)
RETURNS VOID AS $$
DECLARE
    total_weight NUMERIC := 0;
    weighted_progress NUMERIC := 0;
    kr_count INT := 0;
    alignment_count INT := 0;
    child_objective_record RECORD;
    key_result_record RECORD;
    alignment_record RECORD;
    is_locked BOOLEAN;
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
    
    -- Get weight and progress from key results
    FOR key_result_record IN 
        SELECT weight, progress 
        FROM key_results 
        WHERE key_results.objective_id = calculate_cascaded_objective_progress.objective_id
    LOOP
        weighted_progress := weighted_progress + (key_result_record.progress * key_result_record.weight);
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
        weighted_progress := weighted_progress + (alignment_record.progress * alignment_record.weight);
        total_weight := total_weight + alignment_record.weight;
        alignment_count := alignment_count + 1;
    END LOOP;
    
    -- Update the objective's progress based on weighted contribution
    IF total_weight > 0 THEN
        -- Calculate progress as weighted average
        UPDATE objectives
        SET 
            progress = LEAST(100, weighted_progress / total_weight),
            -- Auto-update status based on progress
            status = CASE 
                WHEN progress = 100 THEN 'completed'::objective_status
                WHEN status = 'draft' AND progress > 0 THEN 'in_progress'::objective_status
                ELSE status
            END
        WHERE id = calculate_cascaded_objective_progress.objective_id;
    ELSE
        -- If no key results or child objectives with weight, set progress to 0
        UPDATE objectives
        SET progress = 0
        WHERE id = calculate_cascaded_objective_progress.objective_id;
    END IF;
    
    -- Release the lock
    UPDATE okr_progress_calculation_lock 
    SET locked = FALSE
    WHERE okr_progress_calculation_lock.objective_id = calculate_cascaded_objective_progress.objective_id;
    
    -- Log the calculation for debugging
    INSERT INTO okr_history (
        entity_id, 
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        calculate_cascaded_objective_progress.objective_id,
        'objective_progress_calculation',
        'weighted_progress_update',
        '00000000-0000-0000-0000-000000000000',
        jsonb_build_object(
            'total_weight', total_weight,
            'weighted_progress', weighted_progress,
            'kr_count', kr_count,
            'alignment_count', alignment_count,
            'calculated_progress', 
                CASE 
                    WHEN total_weight > 0 THEN weighted_progress / total_weight
                    ELSE 0
                END
        )
    );
    
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
$$ LANGUAGE plpgsql;

-- Update the handle_key_result_changes function to fix any objective_id references there too
CREATE OR REPLACE FUNCTION public.handle_key_result_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate progress for the objective this key result belongs to
    PERFORM calculate_cascaded_objective_progress(NEW.objective_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_key_result_deletion function
CREATE OR REPLACE FUNCTION public.handle_key_result_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate progress for the objective after a key result is deleted
    PERFORM calculate_cascaded_objective_progress(OLD.objective_id);
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Log this fix
INSERT INTO okr_history (
    entity_id, 
    entity_type,
    change_type,
    changed_by,
    new_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_update',
    'fixed_ambiguous_column_reference',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Fixed ambiguous column reference in calculate_cascaded_objective_progress function',
        'timestamp', now()
    )
);
