
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}

function extractEmailParts(text: string) {
  // Split text into lines for processing
  const lines = text.split('\n').map(line => line.trim());
  
  // Extract FROM
  const fromLine = lines.find(line => line.startsWith('FROM:'))?.replace('FROM:', '').trim();
  const fromMatch = fromLine?.match(/([^<]*?)\s*<([^>]+)>|([^\s]+@[^\s]+)/);
  const from = {
    name: (fromMatch?.[1] || 'Unknown').trim(),
    email: fromMatch?.[2] || fromMatch?.[3] || 'unknown@example.com'
  };

  // Extract SUBJECT
  const subject = lines.find(line => line.startsWith('SUBJECT:'))?.replace('SUBJECT:', '').trim() || 'No Subject';

  // Extract content (everything between SUBJECT and KEY POINTS)
  const contentStartIndex = lines.findIndex(line => line.startsWith('SUBJECT:')) + 1;
  const contentEndIndex = lines.findIndex(line => line.startsWith('KEY POINTS:'));
  const content = lines
    .slice(contentStartIndex, contentEndIndex !== -1 ? contentEndIndex : undefined)
    .filter(line => line.length > 0)
    .join('\n')
    .trim();

  // Extract key points
  const keyPoints: string[] = [];
  let collectingKeyPoints = false;
  for (const line of lines) {
    if (line.startsWith('KEY POINTS:')) {
      collectingKeyPoints = true;
      continue;
    }
    if (collectingKeyPoints && line.match(/^\d+\.\s/)) {
      keyPoints.push(line.replace(/^\d+\.\s/, '').trim());
    }
  }

  return {
    from,
    subject,
    content,
    key_points: keyPoints
  };
}

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

    const { scenario } = await req.json();
    if (!scenario || !scenario.story) {
      throw new Error('Invalid scenario data provided');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Based on this scenario:
${scenario.story}

Write an urgent business email FROM THE CLIENT'S PERSPECTIVE to the support/service provider. The email should come from the client who is experiencing issues. Follow EXACTLY this format:

FROM: [Client's Full Name] <[appropriate-email]>
SUBJECT: [Write an urgent subject line about the main issue]

[Write the email body from the CLIENT'S perspective, expressing:
- The specific issues or problems they're experiencing
- The impact on their business or operations
- Their level of frustration and urgency
- Clear expectations or requests for resolution]

KEY POINTS:
1. [First key point about the main issue and its business impact]
2. [Second key point about their expectations]
3. [Third key point about urgency or consequences]

Important guidelines:
- Write FROM the client's perspective
- Use a business email domain that matches the client's organization
- Express genuine frustration while maintaining professionalism
- Include specific details about the problems described in the scenario
- Make the content detailed and technically accurate
- Set up a situation that requires a thoughtful, professional response`;

    console.log('Starting email generation with scenario:', scenario.id);

    // Use retryWithBackoff for the AI operation
    const text = await retryWithBackoff(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    console.log('Successfully generated AI response');
    
    // Validate the response format
    if (!text.includes('FROM:') || !text.includes('SUBJECT:') || !text.includes('KEY POINTS:')) {
      throw new Error('Generated content does not match expected format');
    }

    // Extract and structure the email parts
    const emailData = extractEmailParts(text);
    console.log('Successfully parsed email data');

    return new Response(JSON.stringify(emailData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' 
      },
    });
  } catch (error) {
    console.error('Error in generate-training-email:', error);
    
    // Determine if it's a Gemini API error or other type
    const errorMessage = error.message || 'An unexpected error occurred';
    const statusCode = error.status || 500;

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to generate email content. Please try again.'
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      }
    );
  }
});
