
-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate public access token function
CREATE OR REPLACE FUNCTION generate_public_access_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.public_access_token IS NULL THEN
        NEW.public_access_token := gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, org_id)
  VALUES (new.id, new.email, NULL);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Check if user is admin function
CREATE OR REPLACE FUNCTION is_admin(user_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uid 
    AND role = 'admin'
  );
END;
$$;

-- User cascade deletion function
CREATE OR REPLACE FUNCTION delete_user_cascade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM user_roles WHERE user_id = OLD.id;
    DELETE FROM user_sbus WHERE user_id = OLD.id;
    DELETE FROM user_supervisors WHERE user_id = OLD.id OR supervisor_id = OLD.id;
    DELETE FROM survey_assignments WHERE user_id = OLD.id;
    DELETE FROM survey_responses WHERE user_id = OLD.id;
    UPDATE sbus SET head_id = NULL WHERE head_id = OLD.id;
    
    UPDATE profiles 
    SET 
        employee_role_id = NULL,
        employee_type_id = NULL,
        employment_type_id = NULL,
        level_id = NULL,
        location_id = NULL
    WHERE id = OLD.id;
    
    DELETE FROM profiles WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Search users function
CREATE OR REPLACE FUNCTION search_users(
    search_text TEXT,
    page_number INTEGER,
    page_size INTEGER,
    sbu_filter UUID DEFAULT NULL,
    level_filter UUID DEFAULT NULL,
    location_filter UUID DEFAULT NULL,
    employment_type_filter UUID DEFAULT NULL,
    employee_role_filter UUID DEFAULT NULL,
    employee_type_filter UUID DEFAULT NULL
)
RETURNS TABLE(profile json, total_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- ... keep existing code for search_users function
$$;

-- Calculate instance completion rate function
CREATE OR REPLACE FUNCTION calculate_instance_completion_rate(instance_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
-- ... keep existing code for calculate_instance_completion_rate function
$$;

-- Get campaign analysis data function
CREATE OR REPLACE FUNCTION get_campaign_analysis_data(p_campaign_id UUID, p_instance_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
-- ... keep existing code for get_campaign_analysis_data function
$$;
