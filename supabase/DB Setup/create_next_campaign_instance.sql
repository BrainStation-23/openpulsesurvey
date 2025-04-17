
-- Function to create the next campaign instance based on the last instance
CREATE OR REPLACE FUNCTION public.create_next_campaign_instance(p_campaign_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_campaign RECORD;
    v_last_instance RECORD;
    v_next_period INTEGER;
    v_next_start TIMESTAMPTZ;
    v_next_end TIMESTAMPTZ;
    v_next_instance_id UUID;
    v_frequency TEXT;
    v_duration_days INTEGER;
    v_instance_end_time TIMESTAMPTZ;
BEGIN
    -- Get campaign information
    SELECT 
        is_recurring,
        recurring_frequency,
        instance_duration_days,
        instance_end_time
    INTO v_campaign
    FROM survey_campaigns
    WHERE id = p_campaign_id;
    
    -- If campaign doesn't exist, raise an error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign with ID % not found', p_campaign_id;
    END IF;
    
    -- Get the last instance for this campaign
    SELECT 
        id,
        period_number,
        starts_at,
        ends_at
    INTO v_last_instance
    FROM campaign_instances
    WHERE campaign_id = p_campaign_id
    ORDER BY period_number DESC
    LIMIT 1;
    
    -- If no instances exist yet, raise an exception (should never happen)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existing instances found for campaign %', p_campaign_id;
    END IF;
    
    -- Calculate next period number
    v_next_period := v_last_instance.period_number + 1;
    
    -- Store campaign properties in local variables for clarity
    v_frequency := v_campaign.recurring_frequency;
    v_duration_days := COALESCE(v_campaign.instance_duration_days, 7); -- Default to 7 days if not set
    v_instance_end_time := v_campaign.instance_end_time;
    
    -- Calculate next start date based on the last instance's start date and the campaign's frequency
    CASE v_frequency
        WHEN 'daily' THEN
            v_next_start := v_last_instance.starts_at + INTERVAL '1 day';
        WHEN 'weekly' THEN
            v_next_start := v_last_instance.starts_at + INTERVAL '7 days';
        WHEN 'monthly' THEN
            -- For monthly, we add 1 month while preserving the day of month if possible
            v_next_start := (
                date_trunc('month', v_last_instance.starts_at) + INTERVAL '1 month' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day'
            )::TIMESTAMPTZ;
            
            -- If we went past the end of month, adjust to the last day of the target month
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM date_trunc('month', v_next_start)) THEN
                v_next_start := date_trunc('month', v_next_start + INTERVAL '1 month') - INTERVAL '1 day';
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        WHEN 'quarterly' THEN
            -- For quarterly, we add 3 months while preserving the day of month if possible
            v_next_start := (
                date_trunc('month', v_last_instance.starts_at) + INTERVAL '3 month' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day'
            )::TIMESTAMPTZ;
            
            -- If we went past the end of month, adjust to the last day of the target month
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM date_trunc('month', v_next_start)) THEN
                v_next_start := date_trunc('month', v_next_start + INTERVAL '1 month') - INTERVAL '1 day';
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        WHEN 'yearly' THEN
            -- For yearly, we add 1 year while preserving the month and day if possible
            v_next_start := (
                date_trunc('year', v_last_instance.starts_at) + INTERVAL '1 year' + 
                (EXTRACT(DAY FROM v_last_instance.starts_at) - 1) * INTERVAL '1 day' +
                (EXTRACT(MONTH FROM v_last_instance.starts_at) - 1) * INTERVAL '1 month'
            )::TIMESTAMPTZ;
            
            -- Check if we landed on a valid day (for Feb 29 in leap years)
            IF EXTRACT(MONTH FROM v_next_start) <> EXTRACT(MONTH FROM v_last_instance.starts_at) THEN
                -- Adjust to the last day of the target month
                v_next_start := (
                    date_trunc('month', (
                        date_trunc('year', v_last_instance.starts_at) + INTERVAL '1 year' +
                        (EXTRACT(MONTH FROM v_last_instance.starts_at) - 1) * INTERVAL '1 month'
                    )) + INTERVAL '1 month' - INTERVAL '1 day'
                )::TIMESTAMPTZ;
            END IF;
            
            -- Preserve the time component
            v_next_start := v_next_start + 
                EXTRACT(HOUR FROM v_last_instance.starts_at) * INTERVAL '1 hour' +
                EXTRACT(MINUTE FROM v_last_instance.starts_at) * INTERVAL '1 minute' +
                EXTRACT(SECOND FROM v_last_instance.starts_at) * INTERVAL '1 second';
            
        ELSE
            -- For custom or unrecognized frequency, default to adding the duration days
            v_next_start := v_last_instance.starts_at + (v_duration_days * INTERVAL '1 day');
    END CASE;
    
    -- Calculate end date based on duration and end time
    IF v_instance_end_time IS NOT NULL THEN
        -- Use the instance end time but on the end date calculated from duration
        v_next_end := date_trunc('day', v_next_start + (v_duration_days * INTERVAL '1 day')) +
                      EXTRACT(HOUR FROM v_instance_end_time) * INTERVAL '1 hour' +
                      EXTRACT(MINUTE FROM v_instance_end_time) * INTERVAL '1 minute' +
                      EXTRACT(SECOND FROM v_instance_end_time) * INTERVAL '1 second';
    ELSE
        -- If no specific end time, just add the duration days to the start date
        v_next_end := v_next_start + (v_duration_days * INTERVAL '1 day');
    END IF;
    
    -- Insert the new instance
    INSERT INTO campaign_instances (
        campaign_id,
        period_number,
        starts_at,
        ends_at,
        status
    ) VALUES (
        p_campaign_id,
        v_next_period,
        v_next_start,
        v_next_end,
        CASE 
            WHEN v_next_start <= NOW() AND v_next_end > NOW() THEN 'active'::instance_status
            WHEN v_next_start > NOW() THEN 'upcoming'::instance_status
            ELSE 'completed'::instance_status
        END
    ) RETURNING id INTO v_next_instance_id;
    
    -- Return the ID of the newly created instance
    RETURN v_next_instance_id;
END;
$$;

COMMENT ON FUNCTION public.create_next_campaign_instance IS 'Creates the next campaign instance based on the last instance, considering the campaign frequency and duration settings';
