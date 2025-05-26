
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')
          }
        }
      }
    );

    const { campaignId, instanceId, supervisorId } = await req.json();

    // Get feedback data using the same RPC function
    const { data: feedbackData, error: feedbackError } = await supabaseClient.rpc('get_supervisor_team_feedback', {
      p_campaign_id: campaignId,
      p_instance_id: instanceId,
      p_supervisor_id: supervisorId,
      p_question_name: null
    });

    if (feedbackError) {
      console.error('Error fetching feedback data:', feedbackError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch feedback data'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!feedbackData || feedbackData.status !== 'success' || !feedbackData.data) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No feedback data available'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const prompt = `You are an experienced team performance analyst. You've received structured feedback data from a team about their supervisor, containing both quantitative and qualitative responses.

    **Important Instructions:**
    
    - There are two types of rating questions in the data:
      - **Satisfaction Ratings (Max: 5):**
        - These indicate overall satisfaction, where:
          - 4 or 5 = Positive
          - 3 = Neutral
          - 1 or 2 = Negative
      - **NPS-style Ratings (Max: 10):**
        - These measure likelihood to recommend or strong agreement, where:
          - 9 or 10 = Positive (Promoter)
          - 7 or 8 = Neutral (Passive)
          - 6 or below = Negative (Detractor)
    
    Please interpret the scores using these rules and apply them consistently throughout the analysis.
    
    ---
    
    Based on the following JSON feedback data:
    
    ${JSON.stringify(feedbackData.data, null, 2)}
    
    Generate a professional and constructive report for the supervisor that includes:
    
    ### 1. Executive Summary:
    Briefly summarize the overall sentiment and tone of the feedback.
    
    ### 2. Key Strengths:
    List what the team appreciates most about the supervisor, based on positive trends.
    
    ### 3. Areas for Improvement:
    Identify 2–3 clear themes where improvement is needed, based on patterns in the data.
    
    ### 4. Actionable Recommendations:
    Give 3–5 specific, practical steps the supervisor can take to improve team engagement and satisfaction.
    
    ### 5. Priority Focus:
    Highlight the single most important issue to address immediately.
    
    ### 6. Success Metrics:
    Suggest measurable KPIs or team signals that can be used to track progress after these improvements.
    
    ---
    
    Do **not quote** individual responses. Generalize themes based on overall trends and sentiment. Keep your tone supportive, professional, and focused on improvement.`;

    // Call Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModel = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-1.5-flash';
    
    if (!geminiApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Gemini API key not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    });

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to generate AI analysis'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const geminiData = await geminiResponse.json();
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No analysis generated'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Insert the analysis into the database
    const { error: insertError } = await supabaseClient
      .from('ai_feedback_analysis')
      .upsert({
        campaign_id: campaignId,
        instance_id: instanceId,
        supervisor_id: supervisorId,
        analysis_content: analysis,
        team_size: feedbackData.data.team_size,
        response_rate: feedbackData.data.response_rate
      });

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to save analysis to database'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Analysis successfully generated and saved to database');

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in analyze-reportee-feedback function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
