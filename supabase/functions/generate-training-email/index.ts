
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { scenario } = await req.json();

    const prompt = `Based on this scenario:
    ${scenario.story}

    Generate a realistic email that would be sent by a client or stakeholder in this scenario. Format the response as a JSON object with the following structure:
    {
      "from": "Name <email@example.com>",
      "subject": "A relevant subject line",
      "content": "The email body with proper formatting",
      "tone": "The overall tone of the email (e.g., formal, urgent, friendly)",
      "key_points": ["Key point 1", "Key point 2", "Key point 3"]
    }

    Make sure the email:
    1. Is realistic and professional
    2. Matches the scenario context
    3. Contains appropriate business language
    4. Includes any relevant details from the scenario
    5. Uses proper email formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract and parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to generate properly formatted email');
    }

    const cleanedJson = jsonMatch[0]
      .replace(/`/g, '"')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ');

    const generatedEmail = JSON.parse(cleanedJson);

    return new Response(JSON.stringify(generatedEmail), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate or parse email content'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
