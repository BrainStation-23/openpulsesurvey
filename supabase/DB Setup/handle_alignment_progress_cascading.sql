
-- Create functions and triggers to handle progress propagation through alignments
CREATE OR REPLACE FUNCTION public.propagate_alignment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_source_objective_id UUID;
    v_aligned_objective_id UUID;
    v_alignment_type TEXT;
BEGIN
    -- Get the alignment details
    SELECT 
        a.source_objective_id,
        a.aligned_objective_id,
        a.alignment_type
    INTO 
        v_source_objective_id,
        v_aligned_objective_id,
        v_alignment_type
    FROM okr_alignments a
    WHERE a.id = NEW.id;
    
    -- Only handle progress updates for parent-child alignments
    IF v_alignment_type = 'parent_child' THEN
        -- The source is the parent, so update its progress
        PERFORM calculate_cascaded_objective_progress(v_source_objective_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for alignment creation
DROP TRIGGER IF EXISTS propagate_alignment_progress_trigger ON okr_alignments;
CREATE TRIGGER propagate_alignment_progress_trigger
AFTER INSERT ON okr_alignments
FOR EACH ROW
EXECUTE FUNCTION propagate_alignment_progress();

-- Create trigger function for alignment deletion
CREATE OR REPLACE FUNCTION public.handle_alignment_delete_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If it's a parent-child alignment, update the source (parent) objective
    IF OLD.alignment_type = 'parent_child' THEN
        PERFORM calculate_cascaded_objective_progress(OLD.source_objective_id);
    END IF;
    
    RETURN OLD;
END;
$$;

-- Create trigger for alignment deletion
DROP TRIGGER IF EXISTS handle_alignment_delete_trigger ON okr_alignments;
CREATE TRIGGER handle_alignment_delete_trigger
AFTER DELETE ON okr_alignments
FOR EACH ROW
EXECUTE FUNCTION handle_alignment_delete_progress();

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
    'implemented_alignment_progress_propagation',
    '00000000-0000-0000-0000-000000000000',
    jsonb_build_object(
        'description', 'Added progress propagation through objective alignments',
        'timestamp', now()
    )
);
