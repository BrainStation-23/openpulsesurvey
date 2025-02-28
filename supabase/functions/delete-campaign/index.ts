
BEGIN
  -- Check if the survey is published
  IF EXISTS (
    SELECT 1 
    FROM survey_campaigns 
    WHERE id = OLD.id 
    AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Cannot delete a published survey. Archive it first.';
  END IF;

  -- Delete all related data explicitly
  DELETE FROM campaign_instances WHERE campaign_id = OLD.id;
  DELETE FROM survey_assignments WHERE campaign_id = OLD.id;
  DELETE FROM campaign_cron_jobs WHERE campaign_id = OLD.id;
  
  RETURN OLD;
END;
