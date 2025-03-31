
-- Function to check if a user has permission to create objectives with specific visibility
CREATE OR REPLACE FUNCTION public.can_create_objective_by_visibility(p_user_id UUID, p_visibility TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
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
  
  -- Get the appropriate permission array based on visibility
  SELECT
    CASE 
      WHEN p_visibility = 'organization' THEN can_create_org_objectives
      WHEN p_visibility = 'department' THEN can_create_dept_objectives
      WHEN p_visibility = 'team' THEN can_create_team_objectives
      ELSE can_create_objectives
    END
  INTO v_permission_array
  FROM okr_role_settings
  LIMIT 1;
  
  -- Check if the permission array is empty (anyone can create) or if the user's role is in it
  RETURN array_length(v_permission_array, 1) IS NULL OR v_employee_role_id = ANY(v_permission_array);
END;
$$;

COMMENT ON FUNCTION public.can_create_objective_by_visibility IS 'Checks if a user has permission to create objectives with a specific visibility';
