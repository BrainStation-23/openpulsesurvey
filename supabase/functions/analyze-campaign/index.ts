
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, instanceId, promptId } = await req.json();
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get the prompt template
    const { data: promptData } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/analysis_prompts?id=eq.${promptId}&select=*`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      }
    ).then(res => res.json());

    if (!promptData?.[0]) {
      throw new Error('Prompt not found');
    }

    // Fetch campaign data
    const { data: campaignData } = await fetch(
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

    // Prepare the context for the AI
    const context = `
      Campaign Information:
      ${JSON.stringify(campaignData, null, 2)}

      Please analyze this data and provide insights based on the following prompt:
      ${promptData[0].prompt_text}
    `;

    // Generate the analysis
    const result = await model.generateContent(context);
    const response = result.response;
    const formattedText = response.text().replace(/\n/g, '<br>');

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
      JSON.stringify({ error: error.message }),
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
