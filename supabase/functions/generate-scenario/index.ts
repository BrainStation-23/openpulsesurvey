
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

    const { topic, scenarioType, complexity, situation } = await req.json();

    const prompt = `Generate an email training scenario with the following context:
    Topic/Industry: ${topic}
    Scenario Type: ${scenarioType}
    Complexity Level: ${complexity}
    Specific Situation: ${situation || 'Not specified'}

    Generate a JSON response with the following structure:
    {
      "name": "A concise, descriptive title for the scenario",
      "story": "A detailed story written in HTML format explaining the email scenario. Include background context, challenges, and what needs to be done.",
      "difficulty_level": A number from 1 to 5 (1: Very Easy, 2: Easy, 3: Moderate, 4: Hard, 5: Very Hard),
      "tags": ["tag1", "tag2", "tag3"] (3-5 relevant tags)
    }

    The story should be realistic, relevant to the industry, and focus on email communication challenges.
    Include HTML formatting in the story for better readability (use <p>, <ul>, <li> tags where appropriate).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to generate properly formatted scenario');
    }

    const generatedScenario = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(generatedScenario), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating scenario:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
