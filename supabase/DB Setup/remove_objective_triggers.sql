
-- Drop triggers that update objective progress from key_results
DROP TRIGGER IF EXISTS calculate_objective_progress_trigger ON key_results;
DROP TRIGGER IF EXISTS update_objective_progress_trigger ON key_results;

-- Keep the validate_kr_values trigger which handles boolean values correctly
-- This trigger sets progress = 100 when boolean_value is true and progress = 0 when false
ALTER FUNCTION public.validate_kr_values() RENAME TO validate_kr_values_old;

-- Create an updated validate_kr_values function that properly sets progress for boolean values
CREATE OR REPLACE FUNCTION public.validate_kr_values()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

-- Make sure the trigger is still there after function update
DROP TRIGGER IF EXISTS key_results_validate_trigger ON key_results;
CREATE TRIGGER key_results_validate_trigger
BEFORE INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION validate_kr_values();

-- Drop the functions that calculate objective progress
DROP FUNCTION IF EXISTS public.calculate_objective_progress() CASCADE;
DROP FUNCTION IF EXISTS public.update_objective_progress() CASCADE;
