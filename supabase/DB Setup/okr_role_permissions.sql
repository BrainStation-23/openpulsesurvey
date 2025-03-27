
-- Create OKR Settings table that will store all the role-based permission configurations
CREATE TABLE IF NOT EXISTS okr_role_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Which employee roles can create objectives (array of employee_role_id)
  can_create_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can create Organization-level objectives
  can_create_org_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can create Department-level objectives
  can_create_dept_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can create Team-level objectives
  can_create_team_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can add key results to existing objectives
  can_create_key_results UUID[] DEFAULT '{}',
  
  -- Which employee roles can create alignments between objectives
  can_create_alignments UUID[] DEFAULT '{}',
  
  -- Which employee roles can create alignments with Organization-level objectives
  can_align_with_org_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can create alignments with Department-level objectives
  can_align_with_dept_objectives UUID[] DEFAULT '{}',
  
  -- Which employee roles can create alignments with Team-level objectives
  can_align_with_team_objectives UUID[] DEFAULT '{}'
);

-- Insert default settings (admins have all permissions by default)
INSERT INTO okr_role_settings (
  id,
  can_create_objectives,
  can_create_org_objectives,
  can_create_dept_objectives,
  can_create_team_objectives,
  can_create_key_results,
  can_create_alignments,
  can_align_with_org_objectives,
  can_align_with_dept_objectives,
  can_align_with_team_objectives
) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{}',
  '{}',
  '{}',
  '{}',
  '{}',
  '{}',
  '{}',
  '{}',
  '{}'
);

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_okr_role_settings_updated_at
BEFORE UPDATE ON okr_role_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if a user has permission to create objectives
CREATE OR REPLACE FUNCTION check_okr_create_permission(
  p_user_id UUID,
  p_permission_type TEXT,
  p_visibility TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_permission_array UUID[];
BEGIN
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's employee role
  SELECT employee_role_id INTO v_employee_role_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- If user has no employee role, they don't have permission
  IF v_employee_role_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the appropriate permission array based on permission type and visibility
  CASE 
    WHEN p_permission_type = 'create_objectives' AND p_visibility IS NULL THEN
      SELECT can_create_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'organization' THEN
      SELECT can_create_org_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'department' THEN
      SELECT can_create_dept_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_objectives' AND p_visibility = 'team' THEN
      SELECT can_create_team_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_key_results' THEN
      SELECT can_create_key_results INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility IS NULL THEN
      SELECT can_create_alignments INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'organization' THEN
      SELECT can_align_with_org_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'department' THEN
      SELECT can_align_with_dept_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    WHEN p_permission_type = 'create_alignments' AND p_visibility = 'team' THEN
      SELECT can_align_with_team_objectives INTO v_permission_array FROM okr_role_settings LIMIT 1;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check if the user's role is in the permission array
  -- Empty array means no restrictions (all roles have permission)
  RETURN array_length(v_permission_array, 1) IS NULL OR v_employee_role_id = ANY(v_permission_array);
END;
$$;

-- Create function to check if a user can modify an objective based on ownership
CREATE OR REPLACE FUNCTION check_objective_owner_permission(
  p_user_id UUID,
  p_objective_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_owner BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is the owner of the objective
  SELECT EXISTS (
    SELECT 1 
    FROM objectives 
    WHERE id = p_objective_id 
    AND owner_id = p_user_id
  ) INTO v_is_owner;
  
  RETURN v_is_owner;
END;
$$;

-- Create a policy to secure the okr_role_settings table (only admins can modify)
ALTER TABLE okr_role_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY okr_role_settings_admin_policy
  ON okr_role_settings
  USING (is_admin(auth.uid()));
