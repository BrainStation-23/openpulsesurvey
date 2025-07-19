-- Phase 1: Enhanced Issue Board Permissions System

-- Step 1: Add new columns to issue_board_permissions table
ALTER TABLE public.issue_board_permissions 
ADD COLUMN rule_name TEXT,
ADD COLUMN rule_type TEXT DEFAULT 'include' CHECK (rule_type IN ('include', 'exclude')),
ADD COLUMN priority INTEGER DEFAULT 100,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX idx_issue_board_permissions_board_priority ON public.issue_board_permissions(board_id, priority DESC, is_active);
CREATE INDEX idx_issue_board_permissions_active ON public.issue_board_permissions(is_active) WHERE is_active = true;

-- Step 2: Create enhanced permission resolution function
CREATE OR REPLACE FUNCTION public.get_user_board_permissions(p_user_id UUID, p_board_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_profile RECORD;
    v_user_sbus UUID[];
    v_result JSON;
    v_has_view BOOLEAN := false;
    v_has_create BOOLEAN := false;
    v_has_vote BOOLEAN := false;
    v_applied_rules JSON[] := '{}';
    v_rule RECORD;
BEGIN
    -- Get user profile data
    SELECT * INTO v_user_profile
    FROM profiles 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'can_view', false,
            'can_create', false, 
            'can_vote', false,
            'applied_rules', '[]'::json,
            'error', 'User profile not found'
        );
    END IF;
    
    -- Get user SBUs
    SELECT array_agg(sbu_id) INTO v_user_sbus
    FROM user_sbus 
    WHERE user_id = p_user_id;
    
    -- Check if user is admin
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'admin') THEN
        RETURN json_build_object(
            'can_view', true,
            'can_create', true,
            'can_vote', true,
            'applied_rules', json_build_array(
                json_build_object(
                    'rule_name', 'Admin Override',
                    'rule_type', 'admin',
                    'priority', 0
                )
            )
        );
    END IF;
    
    -- Process permission rules in priority order
    FOR v_rule IN 
        SELECT *
        FROM issue_board_permissions 
        WHERE board_id = p_board_id 
        AND is_active = true
        ORDER BY priority ASC, created_at ASC
    LOOP
        -- Check if rule applies to user
        IF (
            -- Check level match
            (v_rule.level_ids IS NULL OR v_rule.level_ids = '{}' OR v_user_profile.level_id = ANY(v_rule.level_ids))
            AND
            -- Check location match  
            (v_rule.location_ids IS NULL OR v_rule.location_ids = '{}' OR v_user_profile.location_id = ANY(v_rule.location_ids))
            AND
            -- Check employment type match
            (v_rule.employment_type_ids IS NULL OR v_rule.employment_type_ids = '{}' OR v_user_profile.employment_type_id = ANY(v_rule.employment_type_ids))
            AND
            -- Check employee type match
            (v_rule.employee_type_ids IS NULL OR v_rule.employee_type_ids = '{}' OR v_user_profile.employee_type_id = ANY(v_rule.employee_type_ids))
            AND
            -- Check employee role match
            (v_rule.employee_role_ids IS NULL OR v_rule.employee_role_ids = '{}' OR v_user_profile.employee_role_id = ANY(v_rule.employee_role_ids))
            AND
            -- Check SBU match
            (v_rule.sbu_ids IS NULL OR v_rule.sbu_ids = '{}' OR v_user_sbus && v_rule.sbu_ids)
        ) THEN
            -- Apply rule based on type
            IF v_rule.rule_type = 'include' THEN
                v_has_view := v_has_view OR v_rule.can_view;
                v_has_create := v_has_create OR v_rule.can_create;
                v_has_vote := v_has_vote OR v_rule.can_vote;
            ELSIF v_rule.rule_type = 'exclude' THEN
                -- Exclude rules remove permissions
                IF v_rule.can_view THEN v_has_view := false; END IF;
                IF v_rule.can_create THEN v_has_create := false; END IF;
                IF v_rule.can_vote THEN v_has_vote := false; END IF;
            END IF;
            
            -- Track applied rule
            v_applied_rules := v_applied_rules || json_build_object(
                'rule_name', COALESCE(v_rule.rule_name, 'Unnamed Rule'),
                'rule_type', v_rule.rule_type,
                'priority', v_rule.priority,
                'permissions', json_build_object(
                    'can_view', v_rule.can_view,
                    'can_create', v_rule.can_create,
                    'can_vote', v_rule.can_vote
                )
            );
        END IF;
    END LOOP;
    
    -- Enforce permission dependencies
    IF v_has_create AND NOT v_has_view THEN
        v_has_view := true;
    END IF;
    IF v_has_vote AND NOT v_has_view THEN
        v_has_view := true;
    END IF;
    
    -- Build result
    v_result := json_build_object(
        'can_view', v_has_view,
        'can_create', v_has_create,
        'can_vote', v_has_vote,
        'applied_rules', array_to_json(v_applied_rules),
        'user_context', json_build_object(
            'level_id', v_user_profile.level_id,
            'location_id', v_user_profile.location_id,
            'employment_type_id', v_user_profile.employment_type_id,
            'employee_type_id', v_user_profile.employee_type_id,
            'employee_role_id', v_user_profile.employee_role_id,
            'sbu_ids', v_user_sbus
        )
    );
    
    RETURN v_result;
END;
$$;

-- Step 3: Create simplified RLS policies using the new function
DROP POLICY IF EXISTS "Users can read issues in boards they have access to" ON issues;
DROP POLICY IF EXISTS "Users can create issues in boards they have access to" ON issues;
DROP POLICY IF EXISTS "Users can manage their own votes" ON issue_votes;
DROP POLICY IF EXISTS "Users can read votes on accessible issues" ON issue_votes;
DROP POLICY IF EXISTS "Users can read any board permissions" ON issue_board_permissions;

-- New simplified RLS policies for issues
CREATE POLICY "Users can read issues with board permissions" ON issues
FOR SELECT USING (
    COALESCE((get_user_board_permissions(auth.uid(), board_id)->>'can_view')::boolean, false)
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create issues with board permissions" ON issues
FOR INSERT WITH CHECK (
    COALESCE((get_user_board_permissions(auth.uid(), board_id)->>'can_create')::boolean, false)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- New simplified RLS policies for votes
CREATE POLICY "Users can vote with board permissions" ON issue_votes
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM issues i 
        WHERE i.id = issue_votes.issue_id 
        AND COALESCE((get_user_board_permissions(auth.uid(), i.board_id)->>'can_vote')::boolean, false)
    )
);

CREATE POLICY "Users can read votes with board permissions" ON issue_votes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM issues i 
        WHERE i.id = issue_votes.issue_id 
        AND (
            COALESCE((get_user_board_permissions(auth.uid(), i.board_id)->>'can_view')::boolean, false)
            OR auth.uid() = i.created_by
            OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
        )
    )
);

-- New simplified RLS policy for downvotes
DROP POLICY IF EXISTS "Enable users to view permitted data" ON issue_downvotes;
DROP POLICY IF EXISTS "Policy with security definer functions" ON issue_downvotes;

CREATE POLICY "Users can downvote with board permissions" ON issue_downvotes
FOR ALL USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM issues i 
        WHERE i.id = issue_downvotes.issue_id 
        AND COALESCE((get_user_board_permissions(auth.uid(), i.board_id)->>'can_vote')::boolean, false)
    )
);

CREATE POLICY "Users can read downvotes with board permissions" ON issue_downvotes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM issues i 
        WHERE i.id = issue_downvotes.issue_id 
        AND (
            COALESCE((get_user_board_permissions(auth.uid(), i.board_id)->>'can_view')::boolean, false)
            OR auth.uid() = i.created_by
            OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
        )
    )
);

-- Update existing permission records with new structure
UPDATE issue_board_permissions 
SET 
    rule_name = CASE 
        WHEN can_view AND can_create AND can_vote THEN 'Full Access Rule'
        WHEN can_view AND can_create THEN 'View & Create Rule'
        WHEN can_view AND can_vote THEN 'View & Vote Rule'
        WHEN can_view THEN 'View Only Rule'
        ELSE 'Custom Rule'
    END,
    rule_type = 'include',
    priority = 100,
    is_active = true
WHERE rule_name IS NULL;