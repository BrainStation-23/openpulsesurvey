
-- First, identify any constraints on the okr_alignments table related to weight
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'okr_alignments'::regclass::oid
    AND conname LIKE '%weight%';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE okr_alignments DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
END$$;

-- Add a new constraint that only ensures the weight is positive (greater than 0)
ALTER TABLE okr_alignments
ADD CONSTRAINT okr_alignment_weight_check
CHECK (weight > 0);

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
    'updated_alignment_weight_constraint',
    auth.uid(),
    jsonb_build_object(
        'description', 'Updated weight constraint for alignments to allow any positive value',
        'timestamp', now()
    )
);
