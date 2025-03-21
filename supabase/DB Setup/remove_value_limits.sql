
-- Create a new function that doesn't limit the numeric range
CREATE OR REPLACE FUNCTION public.validate_kr_values()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
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
    
    -- Log the validation process 
    INSERT INTO okr_history (
        entity_id, 
        entity_type,
        change_type,
        changed_by,
        new_data
    ) VALUES (
        NEW.id,
        'key_result_validation',
        'progress_calculation',
        NEW.owner_id,
        jsonb_build_object(
            'start_value', NEW.start_value,
            'current_value', NEW.current_value,
            'target_value', NEW.target_value,
            'boolean_value', NEW.boolean_value,
            'measurement_type', NEW.measurement_type,
            'calculated_progress', NEW.progress
        )
    );
    
    RETURN NEW;
END;
$function$;

-- Recreate the trigger if it was dropped
DROP TRIGGER IF EXISTS key_results_validate_trigger ON key_results;
CREATE TRIGGER key_results_validate_trigger
BEFORE INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION validate_kr_values();

-- Make sure the objective progress calculation triggers are in place
DROP TRIGGER IF EXISTS calculate_objective_progress_trigger ON key_results;
CREATE TRIGGER calculate_objective_progress_trigger
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION calculate_objective_progress();

DROP TRIGGER IF EXISTS update_objective_progress_trigger ON key_results;
CREATE TRIGGER update_objective_progress_trigger
AFTER DELETE ON key_results
FOR EACH ROW EXECUTE FUNCTION update_objective_progress();

-- Log this action
INSERT INTO okr_history (
    entity_id, 
    entity_type,
    change_type,
    changed_by,
    new_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_update',
    'removed_numeric_limits',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Removed numeric limits on key result values to allow full floating point range',
        'timestamp', now()
    )
);

-- Recalculate all objective progress to ensure everything is up to date
SELECT recalculate_all_objective_progress();
