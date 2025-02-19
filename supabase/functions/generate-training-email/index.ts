
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { scenario } = await req.json();

    const prompt = `Based on this scenario:
    ${scenario.story}

    Write a professional business email following EXACTLY this format:

    FROM: [Full Name] <email@domain.com>
    SUBJECT: [Write a clear subject line]

    [Write the email body here. Make it professional and relevant to the scenario]

    KEY POINTS:
    1. [First key point from the email]
    2. [Second key point from the email]
    3. [Third key point from the email]

    Important:
    - Use a relevant business email domain that matches the scenario
    - Make the content realistic and professional
    - Ensure the email tone matches the scenario context
    - Include specific details from the scenario`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text);

    // Extract and structure the email parts
    const emailData = extractEmailParts(text);
    console.log('Structured email data:', emailData);

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate or process email content'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
