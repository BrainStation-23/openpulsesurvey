
CREATE OR REPLACE FUNCTION public.get_team_data(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_supervisor_data json;
  v_team_members json;
  v_direct_reports json;
BEGIN
  -- Log the start of the function
  RAISE LOG 'get_team_data called for user_id: %', p_user_id;
  
  -- Get supervisor data
  SELECT json_build_object(
    'id', sup.id,
    'firstName', sup.first_name,
    'lastName', sup.last_name,
    'email', sup.email,
    'designation', sup.designation,
    'profileImageUrl', sup.profile_image_url,
    'level', CASE 
      WHEN l.id IS NOT NULL THEN json_build_object(
        'id', l.id,
        'name', l.name,
        'color_code', l.color_code,
        'rank', COALESCE(l.rank, 0)
      )
      ELSE NULL
    END
  )
  INTO v_supervisor_data
  FROM user_supervisors us
  JOIN profiles sup ON sup.id = us.supervisor_id
  LEFT JOIN levels l ON l.id = sup.level_id
  WHERE us.user_id = p_user_id
    AND us.is_primary = true;

  RAISE LOG 'Supervisor data found: %', CASE WHEN v_supervisor_data IS NOT NULL THEN 'YES' ELSE 'NO' END;

  -- Get team members (peers + current user)
  WITH supervisor_id AS (
    SELECT us.supervisor_id
    FROM user_supervisors us
    WHERE us.user_id = p_user_id
      AND us.is_primary = true
  ),
  all_team_members AS (
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.designation,
      p.profile_image_url,
      p.id = p_user_id AS is_logged_in_user,
      l.id as level_id,
      l.name as level_name,
      l.color_code as level_color_code,
      l.rank as level_rank
    FROM user_supervisors us
    JOIN profiles p ON p.id = us.user_id
    LEFT JOIN levels l ON l.id = p.level_id
    WHERE us.supervisor_id = (SELECT supervisor_id FROM supervisor_id)
      AND us.is_primary = true
    
    UNION
    
    -- Include current user if they don't have a supervisor
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.designation,
      p.profile_image_url,
      true AS is_logged_in_user,
      l.id as level_id,
      l.name as level_name,
      l.color_code as level_color_code,
      l.rank as level_rank
    FROM profiles p
    LEFT JOIN levels l ON l.id = p.level_id
    WHERE p.id = p_user_id
      AND NOT EXISTS (SELECT 1 FROM supervisor_id)
  )
  SELECT json_agg(
    json_build_object(
      'id', atm.id,
      'firstName', atm.first_name,
      'lastName', atm.last_name,
      'email', atm.email,
      'designation', atm.designation,
      'profileImageUrl', atm.profile_image_url,
      'isLoggedInUser', atm.is_logged_in_user,
      'level', CASE 
        WHEN atm.level_id IS NOT NULL THEN json_build_object(
          'id', atm.level_id,
          'name', atm.level_name,
          'color_code', atm.level_color_code,
          'rank', COALESCE(atm.level_rank, 999)
        )
        ELSE NULL
      END
    )
  )
  INTO v_team_members
  FROM all_team_members atm;

  RAISE LOG 'Team members count: %', COALESCE(json_array_length(v_team_members), 0);

  -- Get direct reports
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'firstName', p.first_name,
      'lastName', p.last_name,
      'email', p.email,
      'designation', p.designation,
      'profileImageUrl', p.profile_image_url,
      'level', CASE 
        WHEN l.id IS NOT NULL THEN json_build_object(
          'id', l.id,
          'name', l.name,
          'color_code', l.color_code,
          'rank', COALESCE(l.rank, 999)
        )
        ELSE NULL
      END
    )
  )
  INTO v_direct_reports
  FROM user_supervisors us
  JOIN profiles p ON p.id = us.user_id
  LEFT JOIN levels l ON l.id = p.level_id
  WHERE us.supervisor_id = p_user_id
    AND us.is_primary = true;

  RAISE LOG 'Direct reports count: %', COALESCE(json_array_length(v_direct_reports), 0);

  -- Build final result
  v_result := json_build_object(
    'supervisor', v_supervisor_data,
    'teamMembers', COALESCE(v_team_members, '[]'::json),
    'directReports', COALESCE(v_direct_reports, '[]'::json)
  );

  RAISE LOG 'get_team_data completed successfully for user_id: %', p_user_id;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in get_team_data for user_id %: % %', p_user_id, SQLERRM, SQLSTATE;
    -- Return empty structure on error
    RETURN json_build_object(
      'supervisor', null,
      'teamMembers', '[]'::json,
      'directReports', '[]'::json,
      'error', SQLERRM
    );
END;
$$;
