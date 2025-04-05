
-- Create a table for tracking user activities
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add indexes for better query performance
  CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Grant necessary permissions
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own logs
CREATE POLICY user_select_own_activity_logs ON public.user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for admins to view all logs
CREATE POLICY admin_manage_all_activity_logs ON public.user_activity_logs
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log user authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    description,
    ip_address,
    metadata
  ) VALUES (
    NEW.id,
    'auth.login',
    'User logged in',
    NEW.ip::varchar,
    jsonb_build_object(
      'user_agent', NEW.user_agent,
      'auth_event', NEW.event_type
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth events
DROP TRIGGER IF EXISTS on_auth_event_trigger ON auth.audit_log_entries;
CREATE TRIGGER on_auth_event_trigger
  AFTER INSERT ON auth.audit_log_entries
  FOR EACH ROW
  WHEN (NEW.event_type = 'login')
  EXECUTE FUNCTION public.log_auth_event();

-- Function to create an activity log entry
CREATE OR REPLACE FUNCTION public.create_activity_log(
  p_user_id UUID,
  p_activity_type VARCHAR,
  p_description TEXT,
  p_ip_address VARCHAR DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.user_activity_logs(
    user_id,
    activity_type,
    description,
    ip_address,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_ip_address,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION public.create_activity_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_activity_log TO service_role;

-- Log function creation
INSERT INTO public.okr_history (
  entity_id,
  entity_type,
  change_type,
  changed_by,
  new_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system_update',
  'created_user_activity_logs',
  '00000000-0000-0000-0000-000000000000',
  jsonb_build_object(
    'description', 'Created user activity logs table and related functions',
    'timestamp', now()
  )
);

-- Add sample data for testing
INSERT INTO public.user_activity_logs (user_id, activity_type, description, ip_address, metadata, created_at)
SELECT 
  auth.uid(),
  'auth.login',
  'User logged in',
  '127.0.0.1',
  jsonb_build_object('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
  now() - (random() * interval '60 days')
FROM generate_series(1, 10);

INSERT INTO public.user_activity_logs (user_id, activity_type, description, ip_address, metadata, created_at)
SELECT 
  auth.uid(),
  'survey.started',
  'User started a survey',
  '127.0.0.1',
  jsonb_build_object(
    'survey_name', 'Employee Engagement Survey',
    'survey_id', uuid_generate_v4(),
    'completion_percentage', 0
  ),
  now() - (random() * interval '45 days')
FROM generate_series(1, 5);

INSERT INTO public.user_activity_logs (user_id, activity_type, description, ip_address, metadata, created_at)
SELECT 
  auth.uid(),
  'survey.completed',
  'User completed a survey',
  '127.0.0.1',
  jsonb_build_object(
    'survey_name', 'Employee Engagement Survey',
    'survey_id', uuid_generate_v4(),
    'completion_percentage', 100
  ),
  now() - (random() * interval '30 days')
FROM generate_series(1, 5);

INSERT INTO public.user_activity_logs (user_id, activity_type, description, ip_address, metadata, created_at)
SELECT 
  auth.uid(),
  'achievement.unlocked',
  'User unlocked an achievement',
  '127.0.0.1',
  jsonb_build_object(
    'achievement_name', 'Survey Champion',
    'points', 100,
    'category', 'Participation'
  ),
  now() - (random() * interval '20 days')
FROM generate_series(1, 3);

INSERT INTO public.user_activity_logs (user_id, activity_type, description, ip_address, metadata, created_at)
SELECT 
  auth.uid(),
  'security.password_changed',
  'User changed their password',
  '127.0.0.1',
  jsonb_build_object(
    'source', 'user_initiated'
  ),
  now() - (random() * interval '15 days')
FROM generate_series(1, 2);
