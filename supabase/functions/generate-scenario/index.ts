
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

    Generate a scenario in the following format, using double quotes for all strings and escaping any special characters:
    {
      "name": "A concise, descriptive title for the scenario",
      "story": "<p>Your story content here, using proper HTML tags</p>",
      "difficulty_level": A number from 1 to 5 (1: Very Easy, 2: Easy, 3: Moderate, 4: Hard, 5: Very Hard),
      "tags": ["tag1", "tag2", "tag3"]
    }

    Important: 
    - Use proper JSON format with double quotes for strings
    - Use only basic HTML tags (<p>, <ul>, <li>) in the story content
    - Make sure all quotes and special characters are properly escaped
    - The response must be a valid JSON object`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response and clean it up
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to generate properly formatted scenario');
    }

    let cleanedJson = jsonMatch[0]
      // Replace any backticks with double quotes
      .replace(/`/g, '"')
      // Ensure newlines within the story are preserved but properly escaped
      .replace(/\n/g, ' ')
      // Remove any extra spaces
      .replace(/\s+/g, ' ');

    try {
      const generatedScenario = JSON.parse(cleanedJson);
      
      // Validate the structure
      if (!generatedScenario.name || !generatedScenario.story || 
          !generatedScenario.difficulty_level || !Array.isArray(generatedScenario.tags)) {
        throw new Error('Generated content is missing required fields');
      }

      return new Response(JSON.stringify(generatedScenario), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, '\nAttempted to parse:', cleanedJson);
      throw new Error('Failed to parse generated content as JSON');
    }
  } catch (error) {
    console.error('Error generating scenario:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate or parse scenario content'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
