
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'
import { corsHeaders } from '../_shared/cors.ts'
import { RequestHandler } from 'https://deno.land/x/fresh@1.2.0/server.ts'
import { GoogleGenerativeAI, GenerateContentRequest, SafetySetting, HarmCategory, HarmBlockThreshold } from "https://esm.sh/@google/generative-ai@0.1.3"

interface AnalysisRequest {
  promptId: string;
  promptText: string;
  analysisData: Record<string, any>;
}

// Configure safety settings
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Initialize Google Generative AI
const initGoogleAI = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

const handler: RequestHandler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModelName = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-pro';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!geminiApiKey) {
      throw new Error('Missing Gemini API Key');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { promptId, promptText, analysisData } = await req.json() as AnalysisRequest;

    // Validate inputs
    if (!promptId || !promptText || !analysisData) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = initGoogleAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      safetySettings,
    });

    // Create AI prompt with context
    const prompt = `
You are an expert data analyst specializing in survey analysis and employee feedback.

Analyze the following survey data and respond to this specific prompt:
${promptText}

Here is the campaign data:
${JSON.stringify(analysisData, null, 2)}

Provide a comprehensive analysis that is helpful to HR managers and executives.
Ensure your analysis is:
1. Evidence-based, citing specific data points
2. Actionable, with clear recommendations
3. Formatted with headers, bullet points, and clear structure
4. Professional and objective
`;

    console.log(`Sending request to Gemini for analysis with promptId: ${promptId}`);

    // Generate AI content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Save the analysis to the database
    const { error: saveError } = await supabase
      .from('survey_analyses')
      .insert({
        prompt_id: promptId,
        content: responseText,
        created_at: new Date().toISOString(),
      });

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    // Return the analysis
    return new Response(
      JSON.stringify({ content: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-campaign function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

Deno.serve(handler);
