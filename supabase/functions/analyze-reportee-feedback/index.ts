
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { campaignId, instanceId, supervisorId } = await req.json();

    // Get feedback data using the same RPC function
    const { data: feedbackData, error: feedbackError } = await supabaseClient.rpc(
      'get_supervisor_team_feedback',
      {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_supervisor_id: supervisorId,
        p_question_name: null
      }
    );

    if (feedbackError) {
      console.error('Error fetching feedback data:', feedbackError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch feedback data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!feedbackData || feedbackData.status !== 'success' || !feedbackData.data) {
      return new Response(
        JSON.stringify({ error: 'No feedback data available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for Gemini analysis
    const analysisData = {
      team_size: feedbackData.data.team_size,
      response_count: feedbackData.data.response_count,
      response_rate: feedbackData.data.response_rate,
      questions: feedbackData.data.questions.map(q => ({
        title: q.question_title,
        type: q.question_type,
        response_count: q.response_count,
        avg_value: q.avg_value,
        // For text responses, only include count and general themes, not actual text
        has_text_responses: q.question_type === 'text' && q.distribution && q.distribution.length > 0,
        text_response_count: q.question_type === 'text' ? (q.distribution?.length || 0) : 0,
        // For rating questions, include distribution summary
        rating_summary: q.question_type === 'rating' && q.distribution ? 
          q.distribution.reduce((acc, item) => {
            if (item.value <= 2) acc.low++;
            else if (item.value <= 3) acc.medium++;
            else acc.high++;
            return acc;
          }, { low: 0, medium: 0, high: 0 }) : null,
        // For boolean questions, include yes/no percentages
        boolean_summary: q.question_type === 'boolean' && q.distribution ? {
          yes_percentage: Math.round((q.distribution.true_count / (q.distribution.true_count + q.distribution.false_count)) * 100),
          no_percentage: Math.round((q.distribution.false_count / (q.distribution.true_count + q.distribution.false_count)) * 100)
        } : null
      }))
    };

    const prompt = `
You are an expert management consultant analyzing team feedback data for a supervisor. Based on the following team feedback summary, provide actionable insights and improvement recommendations.

Team Feedback Summary:
- Team Size: ${analysisData.team_size}
- Response Rate: ${analysisData.response_rate}% (${analysisData.response_count} responses)

Question Analysis:
${analysisData.questions.map(q => `
- ${q.title} (${q.type} question, ${q.response_count} responses)
  ${q.avg_value ? `Average Score: ${q.avg_value.toFixed(1)}` : ''}
  ${q.rating_summary ? `Distribution: ${q.rating_summary.high} high, ${q.rating_summary.medium} medium, ${q.rating_summary.low} low scores` : ''}
  ${q.boolean_summary ? `Results: ${q.boolean_summary.yes_percentage}% yes, ${q.boolean_summary.no_percentage}% no` : ''}
  ${q.has_text_responses ? `Text feedback provided by ${q.text_response_count} team members` : ''}
`).join('')}

Please provide:
1. **Key Strengths**: What's working well based on the data
2. **Areas for Improvement**: Specific areas that need attention
3. **Actionable Recommendations**: 3-5 concrete steps the supervisor can take
4. **Priority Focus**: What should be addressed first
5. **Success Metrics**: How to measure improvement

Keep the analysis professional, constructive, and focused on actionable insights. Do not mention specific text responses, but consider the overall sentiment and themes when text feedback is available.
`;

    // Call Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModel = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-1.5-flash';

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        analysis,
        metadata: {
          team_size: analysisData.team_size,
          response_rate: analysisData.response_rate,
          generated_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-reportee-feedback function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
