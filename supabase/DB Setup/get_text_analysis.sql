
-- Function to perform word frequency analysis on text responses
CREATE OR REPLACE FUNCTION public.get_text_analysis(
  p_campaign_id UUID,
  p_instance_id UUID,
  p_question_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH response_texts AS (
    SELECT 
      r.response_data->>p_question_name AS answer_text
    FROM survey_responses r
    JOIN survey_assignments sa ON sa.id = r.assignment_id
    WHERE sa.campaign_id = p_campaign_id
    AND (p_instance_id IS NULL OR r.campaign_instance_id = p_instance_id)
    AND r.response_data->>p_question_name IS NOT NULL
    AND LENGTH(r.response_data->>p_question_name) > 0
  ),
  -- This is a simple implementation of word frequency
  -- For more advanced text analysis, consider using extensions like pg_trgm
  word_counts AS (
    SELECT 
      word,
      COUNT(*) AS frequency
    FROM (
      SELECT 
        regexp_split_to_table(lower(answer_text), E'\\s+') AS word
      FROM response_texts
    ) AS words
    WHERE length(word) > 2  -- Ignore very short words
    AND word !~ '[^a-zA-Z]'  -- Only include alphabetic words
    GROUP BY word
    ORDER BY frequency DESC
    LIMIT 50  -- Limit to top 50 words
  )
  SELECT json_agg(
    json_build_object(
      'text', word,
      'value', frequency
    )
  )
  INTO v_result
  FROM word_counts;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

COMMENT ON FUNCTION public.get_text_analysis IS 'Perform word frequency analysis on text responses';
