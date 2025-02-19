
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function for retry logic
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retries failed');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing Gemini API key');
    }

    const { sessionId, responseId, originalEmail, userResponse, attemptNumber } = await req.json();
    console.log('Processing analysis request for session:', sessionId, 'attempt:', attemptNumber);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, generate the grading analysis
    const gradingPrompt = `
      You are an expert email response evaluator. Analyze this email exchange and provide a detailed evaluation.
      
      Original Email:
      ${JSON.stringify(originalEmail)}
      
      User's Response:
      ${JSON.stringify(userResponse)}
      
      Provide a JSON response with the following structure:
      {
        "scores": {
          "professionalism": (0-10),
          "completeness": (0-10),
          "clarity": (0-10),
          "solution_quality": (0-10),
          "total_score": (sum of all scores)
        },
        "analysis": {
          "strengths": ["strength1", "strength2", ...],
          "areas_for_improvement": ["area1", "area2", ...],
          "detailed_feedback": "comprehensive feedback"
        }
      }`;

    console.log('Generating grading analysis...');
    const gradeResult = await retryWithBackoff(async () => {
      const result = await model.generateContent(gradingPrompt);
      const response = await result.response;
      return response.text();
    });

    // Parse and validate the grading response
    let grade;
    try {
      grade = JSON.parse(gradeResult);
      console.log('Successfully parsed grade:', grade);
    } catch (error) {
      console.error('Failed to parse grade JSON:', error);
      throw new Error('Invalid grading response format');
    }

    // Generate AI response based on the analysis
    const responsePrompt = `
      You are a helpful email training assistant. Based on the following email exchange and analysis:
      
      Original Email:
      ${JSON.stringify(originalEmail)}
      
      User's Response:
      ${JSON.stringify(userResponse)}
      
      Analysis:
      ${JSON.stringify(grade)}
      
      Provide a constructive and encouraging response to help the user improve their email writing skills.
      Focus on both their strengths and areas for improvement.
      Keep the response professional but friendly.`;

    console.log('Generating AI response...');
    const aiResponse = await retryWithBackoff(async () => {
      const result = await model.generateContent(responsePrompt);
      const response = await result.response;
      return response.text();
    });

    // Determine if training is complete based on score
    const isComplete = grade.scores.total_score >= 35; // Complete if score is 35 or higher

    // Prepare the final response
    const response = {
      grade,
      aiResponse,
      isComplete,
    };

    console.log('Analysis complete. Training complete:', isComplete);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-training-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
