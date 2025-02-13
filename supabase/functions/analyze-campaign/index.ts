
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Function called with request:", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });

    const { campaignId, instanceId, promptId } = await req.json();
    console.log("Received parameters:", { campaignId, instanceId, promptId });

    // Validate required parameters
    if (!campaignId || !promptId) {
      throw new Error('Missing required parameters: campaignId and promptId are required');
    }

    // Validate Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get the prompt template
    console.log("Fetching prompt data...");
    const { data: promptData, error: promptError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/analysis_prompts?id=eq.${promptId}&select=*`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      }
    ).then(res => res.json());

    if (promptError || !promptData?.[0]) {
      console.error("Error fetching prompt:", promptError);
      throw new Error('Prompt not found or error fetching prompt');
    }

    // Fetch campaign data
    console.log("Fetching campaign data...");
    const { data: campaignData, error: campaignError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/get_campaign_analysis_data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        })
      }
    ).then(res => res.json());

    if (campaignError) {
      console.error("Error fetching campaign data:", campaignError);
      throw new Error('Error fetching campaign data');
    }

    // Prepare the context for the AI
    const context = `
      Campaign Information:
      ${JSON.stringify(campaignData, null, 2)}

      Please analyze this data and provide insights based on the following prompt:
      ${promptData[0].prompt_text}
    `;

    console.log("Generating content with Gemini...");
    // Generate the analysis
    const result = await model.generateContent(context);
    const response = result.response;
    const formattedText = response.text().replace(/\n/g, '<br>');

    console.log("Analysis generated successfully");
    return new Response(
      JSON.stringify({ 
        content: formattedText,
        metadata: {
          campaignId,
          instanceId,
          promptId,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-campaign function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
