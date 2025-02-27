
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
    const { campaignId, instanceId, promptId, promptText, analysisData } = await req.json();
    console.log("Received parameters:", { campaignId, instanceId, promptId });

    // Validate required parameters
    if (!campaignId || !promptId || !promptText || !analysisData) {
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

    // Format the data for better AI understanding
    const formattedData = {
      overview: {
        completion_rate: analysisData.instance_info.completion_rate,
        total_assignments: analysisData.instance_info.total_assignments,
        completed_responses: analysisData.instance_info.completed_responses
      },
      demographic_insights: {
        by_department: analysisData.demographic_stats.department,
        by_gender: analysisData.demographic_stats.gender,
        by_location: analysisData.demographic_stats.location,
        by_employment_type: analysisData.demographic_stats.employment_type
      },
      response_trends: analysisData.completion_trends,
      question_analysis: analysisData.question_stats
    };

    // Prepare the context for the AI
    const context = `
      Analysis Data:
      ${JSON.stringify(formattedData, null, 2)}

      Please analyze this data and provide insights based on the following prompt:
      ${promptText}

      Focus on:
      1. Overall response rates and completion trends
      2. Demographic patterns and variations
      3. Question-specific insights (ratings and yes/no questions)
      4. Key trends and notable findings
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
