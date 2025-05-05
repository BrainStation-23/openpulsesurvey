
-- Create the system_versions table to track version information
CREATE TABLE IF NOT EXISTS system_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL,
  released_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE,
  schema_version VARCHAR(20) NOT NULL,
  frontend_version VARCHAR(20) NOT NULL,
  edge_functions_version VARCHAR(20) NOT NULL,
  migration_scripts TEXT[] DEFAULT '{}',
  changelog TEXT,
  release_notes TEXT,
  created_by UUID REFERENCES profiles(id)
);

-- Insert initial version data
INSERT INTO system_versions (
  version,
  schema_version,
  frontend_version,
  edge_functions_version,
  changelog,
  release_notes,
  created_by
) VALUES (
  '0.1.0',
  '0.1.0',
  '0.1.0',
  '0.1.0',
  'Initial system version',
  'Initial release of the Survey Pulse platform',
  NULL
);

-- Function to get current system version
CREATE OR REPLACE FUNCTION get_current_system_version()
RETURNS TABLE(
  version VARCHAR,
  released_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE,
  schema_version VARCHAR,
  frontend_version VARCHAR,
  edge_functions_version VARCHAR,
  changelog TEXT,
  release_notes TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.version,
    sv.released_at,
    sv.applied_at,
    sv.schema_version,
    sv.frontend_version,
    sv.edge_functions_version,
    sv.changelog,
    sv.release_notes
  FROM system_versions sv
  WHERE sv.is_current = TRUE
  LIMIT 1;
END;
$$;

-- Function to update system version (for migration scripts)
CREATE OR REPLACE FUNCTION update_system_version(
  p_version VARCHAR,
  p_schema_version VARCHAR,
  p_frontend_version VARCHAR,
  p_edge_functions_version VARCHAR,
  p_changelog TEXT,
  p_release_notes TEXT,
  p_migration_scripts TEXT[],
  p_created_by UUID
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Set all existing versions to not current
  UPDATE system_versions
  SET is_current = FALSE;
  
  -- Insert new version
  INSERT INTO system_versions (
    version,
    schema_version,
    frontend_version,
    edge_functions_version,
    changelog,
    release_notes,
    migration_scripts,
    created_by,
    is_current
  ) VALUES (
    p_version,
    p_schema_version,
    p_frontend_version,
    p_edge_functions_version,
    p_changelog,
    p_release_notes,
    p_migration_scripts,
    p_created_by,
    TRUE
  ) RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;
