
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseGradingResponse(text: string) {
  console.log('Raw response:', text);
  
  // Default structure
  const grade = {
    scores: {
      professionalism: 0,
      completeness: 0,
      clarity: 0,
      solution_quality: 0,
      total_score: 0
    },
    analysis: {
      strengths: [] as string[],
      areas_for_improvement: [] as string[],
      detailed_feedback: ""
    }
  };

  try {
    // First attempt to find a JSON-like structure
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.scores && parsed.analysis) {
          return parsed;
        }
      } catch (e) {
        console.log('JSON parsing failed, falling back to text parsing');
      }
    }

    // Extract scores - look for numbers after score labels
    const scorePatterns = {
      professionalism: /professionalism[^0-9]*([0-9]+)/i,
      completeness: /completeness[^0-9]*([0-9]+)/i,
      clarity: /clarity[^0-9]*([0-9]+)/i,
      solution_quality: /(solution|quality)[^0-9]*([0-9]+)/i
    };

    for (const [key, pattern] of Object.entries(scorePatterns)) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1], 10);
        if (score >= 0 && score <= 10) {
          grade.scores[key as keyof typeof grade.scores] = score;
        }
      }
    }

    // Calculate total score
    grade.scores.total_score = Object.values(grade.scores).reduce((a, b) => a + b, 0);

    // Extract strengths and improvements
    // Look for bullet points or numbered lists after relevant headers
    const sections = {
      strengths: /strengths?:?([\s\S]*?)(?=(areas?|improvements?|detailed|$))/i,
      improvements: /(?:areas?|improvements?):?([\s\S]*?)(?=(detailed|$))/i,
    };

    for (const [key, pattern] of Object.entries(sections)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const items = match[1]
          .split(/[\n\r]/)
          .map(line => line.replace(/^[-•\d.)\s]+/, '').trim())
          .filter(line => line.length > 0);

        if (key === 'strengths') {
          grade.analysis.strengths = items;
        } else {
          grade.analysis.areas_for_improvement = items;
        }
      }
    }

    // Extract detailed feedback - take everything after "detailed feedback" or similar headers
    const feedbackMatch = text.match(/(?:detailed|comprehensive|overall)[\s\S]*?(?:feedback|analysis):?([\s\S]*?)(?=$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      grade.analysis.detailed_feedback = feedbackMatch[1].trim();
    }

    console.log('Parsed grade:', grade);
    return grade;
  } catch (error) {
    console.error('Error parsing response:', error);
    return grade; // Return default structure if parsing fails
  }
}

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
      Use exactly this format in your response:
      
      PROFESSIONALISM SCORE: (give a score from 0-10)
      COMPLETENESS SCORE: (give a score from 0-10)
      CLARITY SCORE: (give a score from 0-10)
      SOLUTION QUALITY SCORE: (give a score from 0-10)
      
      STRENGTHS:
      - (list key strengths)
      - (continue listing strengths)
      
      AREAS FOR IMPROVEMENT:
      - (list areas to improve)
      - (continue listing areas)
      
      DETAILED FEEDBACK:
      (provide comprehensive feedback)
      
      Original Email:
      ${JSON.stringify(originalEmail)}
      
      User's Response:
      ${JSON.stringify(userResponse)}`;

    console.log('Generating grading analysis...');
    const gradeResult = await retryWithBackoff(async () => {
      const result = await model.generateContent(gradingPrompt);
      const response = await result.response;
      return response.text();
    });

    // Parse the grading response using our robust parser
    const grade = parseGradingResponse(gradeResult);
    console.log('Processed grade:', grade);

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
