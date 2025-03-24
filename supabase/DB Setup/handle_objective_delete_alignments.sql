
-- First, create a function that will handle deletion of alignments
CREATE OR REPLACE FUNCTION public.handle_objective_delete_alignments()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create a trigger that runs before deleting an objective
DROP TRIGGER IF EXISTS handle_objective_delete_alignments_trigger ON objectives;
CREATE TRIGGER handle_objective_delete_alignments_trigger
BEFORE DELETE ON objectives
FOR EACH ROW EXECUTE FUNCTION handle_objective_delete_alignments();

-- Add a comment to document the trigger
COMMENT ON TRIGGER handle_objective_delete_alignments_trigger ON objectives IS 
'Trigger to delete all alignments associated with an objective before the objective itself is deleted';

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
    'add_alignment_cascade_deletion',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Added trigger to delete associated alignments when an objective is deleted',
        'timestamp', now()
    )
);
