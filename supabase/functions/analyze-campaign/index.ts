
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
    const { promptId, promptText, analysisData } = await req.json();
    console.log("Received analysis request:", { promptId, promptText });

    if (!promptId || !promptText || !analysisData) {
      throw new Error('Missing required parameters');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const modelName = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-pro'; // Fallback for backward compatibility
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const context = `
      Survey Analysis Data:
      ${JSON.stringify(analysisData, null, 2)}

      Please analyze this survey data and provide insights based on the following prompt:
      ${promptText}

      Focus on:
      1. Overall completion rates and participation statistics
      2. Response trends and patterns
      3. Key demographic insights
      4. Status distribution analysis
      5. Areas needing attention or improvement
      
      Note: Keep all insights aggregated and avoid identifying individuals.
    `;

    console.log("Generating analysis...");
    const result = await model.generateContent(context);
    const formattedText = result.response.text().replace(/\n/g, '<br>');

    return new Response(
      JSON.stringify({ 
        content: formattedText,
        metadata: {
          promptId,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
