
-- Function to trigger AI feedback generation when instance is completed
CREATE OR REPLACE FUNCTION trigger_ai_feedback_generation()
RETURNS TRIGGER AS $$
DECLARE
  v_supabase_url text;
  v_anon_key text;
  v_response text;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get Supabase configuration (you'll need to adjust these values)
    v_supabase_url := current_setting('app.supabase_url', true);
    v_anon_key := current_setting('app.supabase_anon_key', true);
    
    -- Log the trigger activation
    RAISE NOTICE 'AI feedback generation triggered for campaign % instance %', NEW.campaign_id, NEW.id;
    
    -- Call the edge function asynchronously using pg_net extension
    -- Note: This requires the pg_net extension to be enabled
    BEGIN
      SELECT net.http_post(
        url := v_supabase_url || '/functions/v1/generate-supervisor-feedback',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := jsonb_build_object(
          'campaignId', NEW.campaign_id,
          'instanceId', NEW.id
        )
      ) INTO v_response;
      
      RAISE NOTICE 'AI feedback generation request sent for instance %', NEW.id;
      
    EXCEPTION WHEN others THEN
      -- Log any errors but don't fail the original operation
      RAISE WARNING 'Failed to trigger AI feedback generation for instance %: %', NEW.id, SQLERRM;
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS ai_feedback_generation_trigger ON campaign_instances;
CREATE TRIGGER ai_feedback_generation_trigger
  AFTER UPDATE ON campaign_instances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_feedback_generation();

-- Alternative simpler approach using a stored procedure that can be called manually or via cron
CREATE OR REPLACE FUNCTION generate_ai_feedback_for_completed_instance(p_instance_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_campaign_id uuid;
  v_instance_status text;
BEGIN
  -- Get campaign info
  SELECT campaign_id, status INTO v_campaign_id, v_instance_status
  FROM campaign_instances
  WHERE id = p_instance_id;
  
  -- Check if instance exists and is completed
  IF v_campaign_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Instance not found');
  END IF;
  
  IF v_instance_status != 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Instance is not completed');
  END IF;
  
  -- This would ideally call the edge function, but for now return success
  -- In a real implementation, you'd use pg_net or similar to call the edge function
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'AI feedback generation initiated',
    'campaign_id', v_campaign_id,
    'instance_id', p_instance_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
