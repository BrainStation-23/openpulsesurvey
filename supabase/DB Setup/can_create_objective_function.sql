
-- Function to check if a user has permission to create objectives
CREATE OR REPLACE FUNCTION public.can_create_objective(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_employee_role_id UUID;
  v_can_create BOOLEAN := FALSE;
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
  
  -- Check if the user's role is in any of the permission arrays
  -- or if the arrays are empty (which means anyone can create)
  SELECT 
    (
      -- Either the array is empty (allows all)
      array_length(can_create_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_objectives) OR
      array_length(can_create_org_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_org_objectives) OR
      array_length(can_create_dept_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_dept_objectives) OR
      array_length(can_create_team_objectives, 1) IS NULL OR
      v_employee_role_id = ANY(can_create_team_objectives)
    )
  INTO v_can_create
  FROM okr_role_settings
  LIMIT 1;
  
  RETURN COALESCE(v_can_create, FALSE);
END;
$$;

COMMENT ON FUNCTION public.can_create_objective IS 'Checks if a user has permission to create any type of objective';
