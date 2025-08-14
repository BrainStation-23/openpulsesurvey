
-- Enable RLS on campaign_instance_status_logs table
ALTER TABLE campaign_instance_status_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to view system logs
CREATE POLICY "Admins can view system logs" ON campaign_instance_status_logs
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy to allow only admins to insert system logs (for automated processes)
CREATE POLICY "Admins can insert system logs" ON campaign_instance_status_logs
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow system processes to insert logs (for automated cron jobs)
-- This policy allows inserts when there's no authenticated user (for system processes)
CREATE POLICY "System processes can insert logs" ON campaign_instance_status_logs
FOR INSERT 
WITH CHECK (auth.uid() IS NULL);
