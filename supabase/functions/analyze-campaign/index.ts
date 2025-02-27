
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
    const { campaignId, instanceId, promptId, promptText, campaignData } = await req.json();
    console.log("Received parameters:", { campaignId, instanceId, promptId });

    // Validate required parameters
    if (!campaignId || !promptId || !promptText || !campaignData) {
      throw new Error('Missing required parameters');
    }

    // Validate Gemini API key and model name
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const modelName = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-2.0-flash-lite';
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log("Using Gemini model:", modelName);
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare the context for the AI
    const context = `
      Campaign Information:
      ${JSON.stringify(campaignData, null, 2)}

      Please analyze this data and provide insights based on the following prompt:
      ${promptText}
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
        details: error.stack,
        timestamp: new Date().toISOString()
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
