
-- This SQL script enhances the deletion process for objectives
-- to properly handle both alignments and parent-child relationships

-- First, create a comprehensive function that handles all cascading deletes
CREATE OR REPLACE FUNCTION public.handle_objective_delete_cascade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- First, update any child objectives to remove the parent reference
    -- This addresses the foreign key constraint issue
    UPDATE objectives
    SET parent_objective_id = NULL
    WHERE parent_objective_id = OLD.id;
    
    -- Delete all alignments where this objective is the source
    DELETE FROM okr_alignments 
    WHERE source_objective_id = OLD.id;
    
    -- Delete all alignments where this objective is the target
    DELETE FROM okr_alignments 
    WHERE aligned_objective_id = OLD.id;
    
    -- Log the cascade deletion
    INSERT INTO okr_history (
        entity_id,
        entity_type,
        change_type,
        changed_by,
        previous_data
    ) VALUES (
        OLD.id,
        'objective_cascade_deletion',
        'delete_cascade',
        auth.uid(),
        jsonb_build_object(
            'objective_id', OLD.id,
            'objective_title', OLD.title,
            'cascade_types', jsonb_build_array('parent_child_relationships', 'alignments')
        )
    );
    
    RETURN OLD;
END;
$$;

-- Drop the previous trigger if it exists
DROP TRIGGER IF EXISTS handle_objective_delete_alignments_trigger ON objectives;

-- Create the new comprehensive trigger
DROP TRIGGER IF EXISTS handle_objective_delete_cascade_trigger ON objectives;
CREATE TRIGGER handle_objective_delete_cascade_trigger
BEFORE DELETE ON objectives
FOR EACH ROW EXECUTE FUNCTION handle_objective_delete_cascade();

-- Add a comment to document the trigger
COMMENT ON TRIGGER handle_objective_delete_cascade_trigger ON objectives IS 
'Trigger to handle cascading deletions when an objective is deleted - updates child objectives and removes alignments';

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
    'enhanced_cascade_deletion',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Enhanced the objective deletion process to handle both alignments and parent-child relationships',
        'timestamp', now()
    )
);
