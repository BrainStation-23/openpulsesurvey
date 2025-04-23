
-- Create a table to track campaign cron jobs
CREATE TABLE IF NOT EXISTS campaign_cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES survey_campaigns(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('activation', 'completion')),
  cron_schedule TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table to log status changes
CREATE TABLE IF NOT EXISTS campaign_instance_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_to_active INTEGER DEFAULT 0,
  updated_to_completed INTEGER DEFAULT 0,
  run_at TIMESTAMPTZ NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to handle instance activation
CREATE OR REPLACE FUNCTION handle_instance_activation(p_campaign_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_buffer_minutes INTEGER := 2; -- Buffer time to ensure we don't miss instances
BEGIN
  -- Update instances that are past their start time but are still 'upcoming'
  UPDATE campaign_instances
  SET status = 'active', updated_at = NOW()
  WHERE campaign_id = p_campaign_id
    AND status = 'upcoming'
    AND starts_at <= (NOW() + (v_buffer_minutes || ' minutes')::INTERVAL)
    AND ends_at > NOW();
    
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log the execution
  IF v_updated_count > 0 THEN
    INSERT INTO campaign_instance_status_logs (
      updated_to_active, 
      updated_to_completed, 
      run_at, 
      details
    ) VALUES (
      v_updated_count,
      0,
      NOW(),
      jsonb_build_object(
        'campaign_id', p_campaign_id,
        'current_time', NOW(),
        'buffer_minutes', v_buffer_minutes,
        'instances_actually_updated', v_updated_count,
        'execution_details', 'Found ' || v_updated_count || ' eligible instances, activated ' || v_updated_count
      )
    );
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle instance completion
CREATE OR REPLACE FUNCTION handle_instance_completion(p_campaign_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_buffer_minutes INTEGER := 2; -- Buffer time
  instance_id UUID;
BEGIN
  -- Update instances that are past their end time but are still 'active'
  UPDATE campaign_instances
  SET status = 'completed', updated_at = NOW()
  WHERE campaign_id = p_campaign_id
    AND status = 'active'
    AND ends_at <= (NOW() + (v_buffer_minutes || ' minutes')::INTERVAL);
    
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Recalculate completion rates for each completed instance
  IF v_updated_count > 0 THEN
    -- Log the execution
    INSERT INTO campaign_instance_status_logs (
      updated_to_active, 
      updated_to_completed, 
      run_at, 
      details
    ) VALUES (
      0,
      v_updated_count,
      NOW(),
      jsonb_build_object(
        'campaign_id', p_campaign_id,
        'current_time', NOW(),
        'buffer_minutes', v_buffer_minutes,
        'instances_actually_updated', v_updated_count,
        'execution_details', 'Found ' || v_updated_count || ' eligible instances, completed ' || v_updated_count
      )
    );
    
    -- Update completion rates
    FOR instance_id IN 
      SELECT id FROM campaign_instances 
      WHERE campaign_id = p_campaign_id 
      AND status = 'completed' 
      AND updated_at >= (NOW() - INTERVAL '5 minutes')
    LOOP
      PERFORM calculate_instance_completion_rate(instance_id);
    END LOOP;
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to manage cron jobs
CREATE OR REPLACE FUNCTION manage_instance_cron_job(
  p_campaign_id UUID,
  p_job_type TEXT,
  p_cron_schedule TEXT,
  p_is_active BOOLEAN
) RETURNS TEXT AS $$
DECLARE
  v_job_name TEXT;
  v_function_name TEXT;
  v_old_job_record RECORD;
  v_cron_job_id INTEGER;
BEGIN
  -- Validate job type
  IF p_job_type NOT IN ('activation', 'completion') THEN
    RAISE EXCEPTION 'Invalid job type. Must be "activation" or "completion"';
  END IF;
  
  -- Set function name based on job type
  IF p_job_type = 'activation' THEN
    v_function_name := 'handle_instance_activation';
  ELSE
    v_function_name := 'handle_instance_completion';
  END IF;
  
  -- Create standardized job name
  v_job_name := 'campaign_' || p_campaign_id || '_instance_' || p_job_type;
  
  -- Check if the job already exists
  SELECT * INTO v_old_job_record 
  FROM campaign_cron_jobs
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  -- If job exists in our tracking table, check cron.job
  IF FOUND THEN
    -- Try to unschedule the existing job if it's in cron.job
    BEGIN
      PERFORM cron.unschedule(v_old_job_record.job_name);
    EXCEPTION WHEN OTHERS THEN
      -- Job might not exist in cron.job table, ignore error
      NULL;
    END;
  END IF;
  
  -- Schedule the new job if it should be active
  IF p_is_active THEN
    v_cron_job_id := cron.schedule(
      v_job_name, 
      p_cron_schedule, 
      format('SELECT %s(''%s'')', v_function_name, p_campaign_id)
    );
  END IF;
  
  -- Update or insert entry in campaign_cron_jobs table
  IF FOUND THEN
    UPDATE campaign_cron_jobs
    SET 
      cron_schedule = p_cron_schedule,
      is_active = p_is_active,
      job_name = v_job_name,
      updated_at = NOW()
    WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  ELSE
    INSERT INTO campaign_cron_jobs (
      campaign_id,
      job_type,
      job_name,
      cron_schedule,
      is_active
    ) VALUES (
      p_campaign_id,
      p_job_type,
      v_job_name,
      p_cron_schedule,
      p_is_active
    );
  END IF;
  
  RETURN v_job_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to toggle job status
CREATE OR REPLACE FUNCTION toggle_instance_cron_job(
  p_campaign_id UUID,
  p_job_type TEXT,
  p_is_active BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
  v_job_record RECORD;
BEGIN
  -- Get the job record
  SELECT * INTO v_job_record 
  FROM campaign_cron_jobs
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No job found for campaign_id % and job_type %', p_campaign_id, p_job_type;
  END IF;
  
  -- If we're activating and the job is currently inactive
  IF p_is_active AND NOT v_job_record.is_active THEN
    -- Schedule the job
    PERFORM cron.schedule(
      v_job_record.job_name, 
      v_job_record.cron_schedule, 
      CASE 
        WHEN v_job_record.job_type = 'activation' THEN 
          format('SELECT handle_instance_activation(''%s'')', p_campaign_id)
        ELSE 
          format('SELECT handle_instance_completion(''%s'')', p_campaign_id)
      END
    );
  -- If we're deactivating and the job is currently active
  ELSIF NOT p_is_active AND v_job_record.is_active THEN
    -- Unschedule the job
    PERFORM cron.unschedule(v_job_record.job_name);
  END IF;
  
  -- Update the record
  UPDATE campaign_cron_jobs
  SET 
    is_active = p_is_active,
    updated_at = NOW()
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to manually run a job
CREATE OR REPLACE FUNCTION run_instance_job_now(
  p_campaign_id UUID,
  p_job_type TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_result INTEGER;
BEGIN
  -- Validate job type
  IF p_job_type NOT IN ('activation', 'completion') THEN
    RAISE EXCEPTION 'Invalid job type. Must be "activation" or "completion"';
  END IF;
  
  -- Call the appropriate function
  IF p_job_type = 'activation' THEN
    SELECT handle_instance_activation(p_campaign_id) INTO v_result;
  ELSE
    SELECT handle_instance_completion(p_campaign_id) INTO v_result;
  END IF;
  
  -- Update last_run timestamp
  UPDATE campaign_cron_jobs
  SET last_run = NOW()
  WHERE campaign_id = p_campaign_id AND job_type = p_job_type;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
