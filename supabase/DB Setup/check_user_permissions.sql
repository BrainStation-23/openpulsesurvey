
-- Create RPC to check generic permissions based on name
CREATE OR REPLACE FUNCTION check_user_has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin (admins always have permission)
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = v_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- For basic permission checks, since these need to be adapted to your specific system
  -- For now simply return false for non-admins, but you can expand this logic
  RETURN FALSE;
END;
$$;

-- Create RPC to check if a user is the owner of an objective
CREATE OR REPLACE FUNCTION check_user_is_owner(p_objective_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_owner BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = v_user_id 
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
    AND owner_id = v_user_id
  ) INTO v_is_owner;
  
  RETURN v_is_owner;
END;
$$;
