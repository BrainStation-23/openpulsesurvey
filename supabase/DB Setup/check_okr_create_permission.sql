
-- Function to check if a user has permission to create OKR items
CREATE OR REPLACE FUNCTION public.check_okr_create_permission(p_user_id UUID, p_permission_type TEXT, p_visibility TEXT DEFAULT NULL)
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

COMMENT ON FUNCTION public.check_okr_create_permission IS 'Checks if a user has permission to perform specific OKR actions based on employee role';
