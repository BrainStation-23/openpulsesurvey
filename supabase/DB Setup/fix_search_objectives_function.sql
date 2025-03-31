
-- Create an improved search_objectives function with proper type handling
CREATE OR REPLACE FUNCTION public.search_objectives(
  p_search_text TEXT DEFAULT '',
  p_status_filters TEXT[] DEFAULT NULL,
  p_visibility_filters TEXT[] DEFAULT NULL,
  p_cycle_id UUID DEFAULT NULL,
  p_sbu_id UUID DEFAULT NULL,
  p_is_admin BOOLEAN DEFAULT FALSE,
  p_user_id UUID DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10,
  p_sort_column TEXT DEFAULT 'created_at',
  p_sort_direction TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER := (p_page_number - 1) * p_page_size;
  v_results JSONB;
  v_total_count INTEGER;
  v_sort_column TEXT := p_sort_column;
  v_sort_direction TEXT := p_sort_direction;
BEGIN
  -- Log function call for debugging
  INSERT INTO okr_history (
    entity_id,
    entity_type,
    change_type,
    changed_by,
    new_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'search_objectives_function',
    'function_call',
    p_user_id,
    jsonb_build_object(
      'search_text', p_search_text,
      'status_filters', p_status_filters,
      'visibility_filters', p_visibility_filters,
      'cycle_id', p_cycle_id,
      'sbu_id', p_sbu_id,
      'is_admin', p_is_admin,
      'page_number', p_page_number,
      'page_size', p_page_size,
      'sort_column', p_sort_column,
      'sort_direction', p_sort_direction
    )
  );

  -- Validate and sanitize sort inputs
  IF v_sort_column NOT IN ('title', 'owner', 'status', 'progress', 'created_at') THEN
    v_sort_column := 'created_at';
  END IF;
  
  IF v_sort_direction NOT IN ('asc', 'desc') THEN
    v_sort_direction := 'desc';
  END IF;

  -- Calculate total count first
  SELECT COUNT(DISTINCT o.id) INTO v_total_count
  FROM objectives o
  LEFT JOIN profiles p ON o.owner_id = p.id
  WHERE (
    p_is_admin -- Admin can see all objectives
    OR
    o.owner_id = p_user_id -- User can see their own objectives
    OR
    o.visibility = 'organization' -- Public objectives are visible to everyone
    OR
    (
      o.visibility = 'department' -- SBU objectives visible to members of the same SBU
      AND EXISTS (
        SELECT 1 FROM user_sbus us 
        WHERE us.user_id = p_user_id AND us.sbu_id = o.sbu_id
      )
    )
    OR
    ( -- User has explicit permission via okr_permissions
      EXISTS (
        SELECT 1 
        FROM okr_permissions op 
        WHERE op.objective_id = o.id 
        AND (
          p_user_id = ANY(op.user_ids)
          OR EXISTS (
            SELECT 1 FROM user_sbus us 
            WHERE us.user_id = p_user_id AND us.sbu_id = ANY(op.sbu_ids)
          )
          OR EXISTS (
            SELECT 1 FROM profiles prof 
            WHERE prof.id = p_user_id AND prof.employee_role_id = ANY(op.employee_role_ids)
          )
        )
        AND op.can_view = true
      )
    )
  )
  -- Apply search filter if provided
  AND (
    p_search_text = '' 
    OR o.title ILIKE '%' || p_search_text || '%' 
    OR o.description ILIKE '%' || p_search_text || '%'
    OR p.first_name ILIKE '%' || p_search_text || '%'
    OR p.last_name ILIKE '%' || p_search_text || '%'
    OR CONCAT(p.first_name, ' ', p.last_name) ILIKE '%' || p_search_text || '%'
  )
  -- Apply status filter if provided
  AND (p_status_filters IS NULL OR o.status::TEXT = ANY(p_status_filters))
  -- Apply visibility filter if provided
  AND (p_visibility_filters IS NULL OR o.visibility::TEXT = ANY(p_visibility_filters))
  -- Apply cycle filter if provided
  AND (p_cycle_id IS NULL OR o.cycle_id = p_cycle_id)
  -- Apply SBU filter if provided
  AND (p_sbu_id IS NULL OR o.sbu_id = p_sbu_id);

  -- Now get the actual results with sorting and pagination
  WITH filtered_objectives AS (
    SELECT 
      o.*,
      -- Owner details
      p.first_name AS owner_first_name,
      p.last_name AS owner_last_name,
      -- Child count (for hierarchical view)
      (SELECT COUNT(*) FROM objectives child WHERE child.parent_objective_id = o.id) AS child_count,
      -- Key results count
      (SELECT COUNT(*) FROM key_results kr WHERE kr.objective_id = o.id) AS key_results_count
    FROM 
      objectives o
    LEFT JOIN 
      profiles p ON o.owner_id = p.id
    WHERE 
      (
        p_is_admin -- Admin can see all objectives
        OR
        o.owner_id = p_user_id -- User can see their own objectives
        OR
        o.visibility = 'organization'
        OR
        (
          o.visibility = 'department' -- SBU objectives visible to members of the same SBU
          AND EXISTS (
            SELECT 1 FROM user_sbus us 
            WHERE us.user_id = p_user_id AND us.sbu_id = o.sbu_id
          )
        )
        OR
        ( -- User has explicit permission via okr_permissions
          EXISTS (
            SELECT 1 
            FROM okr_permissions op 
            WHERE op.objective_id = o.id 
            AND (
              p_user_id = ANY(op.user_ids)
              OR EXISTS (
                SELECT 1 FROM user_sbus us 
                WHERE us.user_id = p_user_id AND us.sbu_id = ANY(op.sbu_ids)
              )
              OR EXISTS (
                SELECT 1 FROM profiles prof 
                WHERE prof.id = p_user_id AND prof.employee_role_id = ANY(op.employee_role_ids)
              )
            )
            AND op.can_view = true
          )
        )
      )
      -- Apply search filter if provided
      AND (
        p_search_text = '' 
        OR o.title ILIKE '%' || p_search_text || '%' 
        OR o.description ILIKE '%' || p_search_text || '%'
        OR p.first_name ILIKE '%' || p_search_text || '%'
        OR p.last_name ILIKE '%' || p_search_text || '%'
        OR CONCAT(p.first_name, ' ', p.last_name) ILIKE '%' || p_search_text || '%'
      )
      -- Apply status filter if provided
      AND (p_status_filters IS NULL OR o.status::TEXT = ANY(p_status_filters))
      -- Apply visibility filter if provided
      AND (p_visibility_filters IS NULL OR o.visibility::TEXT = ANY(p_visibility_filters))
      -- Apply cycle filter if provided
      AND (p_cycle_id IS NULL OR o.cycle_id = p_cycle_id)
      -- Apply SBU filter if provided
      AND (p_sbu_id IS NULL OR o.sbu_id = p_sbu_id)
  )
  SELECT 
    jsonb_build_object(
      'objectives', jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'title', f.title,
          'description', f.description,
          'status', f.status,
          'progress', f.progress,
          'visibility', f.visibility,
          'ownerId', f.owner_id,
          'cycleId', f.cycle_id,
          'parentObjectiveId', f.parent_objective_id,
          'sbuId', f.sbu_id,
          'createdAt', f.created_at,
          'updatedAt', f.updated_at,
          'approvalStatus', f.approval_status,
          'ownerName', CASE WHEN f.owner_first_name IS NOT NULL 
                          THEN CONCAT(f.owner_first_name, ' ', f.owner_last_name) 
                          ELSE NULL END,
          'keyResultsCount', f.key_results_count,
          'childCount', f.child_count
        )
      ),
      'total_count', v_total_count
    ) INTO v_results
  FROM (
    SELECT * FROM filtered_objectives
    ORDER BY
      CASE WHEN v_sort_column = 'title' AND v_sort_direction = 'asc' THEN title END,
      CASE WHEN v_sort_column = 'title' AND v_sort_direction = 'desc' THEN title END DESC,
      CASE WHEN v_sort_column = 'owner' AND v_sort_direction = 'asc' THEN CONCAT(owner_first_name, ' ', owner_last_name) END,
      CASE WHEN v_sort_column = 'owner' AND v_sort_direction = 'desc' THEN CONCAT(owner_first_name, ' ', owner_last_name) END DESC,
      CASE WHEN v_sort_column = 'status' AND v_sort_direction = 'asc' THEN status END,
      CASE WHEN v_sort_column = 'status' AND v_sort_direction = 'desc' THEN status END DESC,
      CASE WHEN v_sort_column = 'progress' AND v_sort_direction = 'asc' THEN progress END,
      CASE WHEN v_sort_column = 'progress' AND v_sort_direction = 'desc' THEN progress END DESC,
      CASE WHEN v_sort_column = 'created_at' AND v_sort_direction = 'asc' THEN created_at END,
      CASE WHEN v_sort_column = 'created_at' AND v_sort_direction = 'desc' THEN created_at END DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) f;

  -- Handle empty result sets
  IF v_results->'objectives' IS NULL THEN
    v_results := jsonb_set(v_results, '{objectives}', '[]');
  END IF;

  -- Log successful execution with result size
  INSERT INTO okr_history (
    entity_id,
    entity_type,
    change_type,
    changed_by,
    new_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'search_objectives_function',
    'execution_result',
    p_user_id,
    jsonb_build_object(
      'total_count', v_total_count,
      'result_size', CASE 
                        WHEN v_results->'objectives' IS NULL THEN 0
                        ELSE jsonb_array_length(v_results->'objectives')
                      END,
      'execution_time', clock_timestamp()
    )
  );

  RETURN jsonb_build_array(v_results);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_objectives TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION search_objectives IS 'Searches and filters objectives based on provided parameters with pagination, visibility rules and sorting';
