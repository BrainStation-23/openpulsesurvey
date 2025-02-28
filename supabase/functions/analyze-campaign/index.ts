
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
    const { promptId, promptText, analysisData } = await req.json();
    console.log("Received parameters:", { promptId, promptText });
    console.log("Analysis data:", analysisData);

    // Validate required parameters
    if (!promptId || !promptText || !analysisData) {
      throw new Error('Missing required parameters');
    }

    // Format the data for better AI understanding
    const formattedData = {
      overview: {
        survey_info: {
          name: analysisData.campaign.survey.name,
          description: analysisData.campaign.survey.description
        },
        completion_rate: analysisData.summary.completion_rate,
        total_responses: analysisData.summary.total_responses
      },
      responses: analysisData.responses.map((response: any) => ({
        user_info: {
          sbu: response.user.sbus?.[0]?.sbu?.name || 'Unassigned',
        },
        response_data: response.response_data
      }))
    };

    // Validate Gemini API key and model name
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const modelName = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-pro';
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log("Using Gemini model:", modelName);
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare the context for the AI
    const context = `
      Analysis Data:
      ${JSON.stringify(formattedData, null, 2)}

      Please analyze this survey data and provide insights based on the following prompt:
      ${promptText}

      Focus on:
      1. Overall response rates and completion statistics
      2. Key patterns in responses
      3. Notable findings and recommendations
      4. Areas that might need attention
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
