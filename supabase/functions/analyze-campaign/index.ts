
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { promptId, promptText, analysisData } = await req.json();
    console.log("Received analysis request for promptId:", promptId);

    if (!promptId || !promptText || !analysisData) {
      throw new Error('Missing required parameters');
    }

    // Process responses by question type
    const processedQuestions: Record<string, any> = {};
    
    analysisData.responses.forEach((response: any) => {
      const answers = response.response_data;
      
      Object.entries(answers).forEach(([questionKey, value]: [string, any]) => {
        if (!processedQuestions[questionKey]) {
          processedQuestions[questionKey] = {
            type: value.type,
            question: value.question,
            answers: []
          };
        }
        
        if (value.answer !== undefined) {
          processedQuestions[questionKey].answers.push(value.answer);
        }
      });
    });

    // Format questions based on their type
    const formattedQuestions = Object.entries(processedQuestions).map(([key, data]: [string, any]) => {
      const { type, question, answers } = data;
      
      switch (type) {
        case 'rating':
          const validRatings = answers.filter((r: any) => typeof r === 'number');
          const avg = validRatings.length > 0 
            ? validRatings.reduce((a: number, b: number) => a + b, 0) / validRatings.length 
            : 0;
          const max = Math.max(...validRatings);
          return {
            question,
            type,
            averageRating: Number(avg.toFixed(2)),
            maxRating: max
          };

        case 'boolean':
          const trueCount = answers.filter((a: any) => a === true).length;
          const falseCount = answers.filter((a: any) => a === false).length;
          return {
            question,
            type,
            trueCount,
            falseCount
          };

        case 'comment':
        case 'text':
          return {
            question,
            type,
            responses: answers.filter((a: any) => typeof a === 'string' && a.trim() !== '')
          };

        default:
          return null;
      }
    }).filter(Boolean);

    // Format data for AI analysis
    const formattedData = {
      survey_name: analysisData.campaign.survey.name,
      total_responses: analysisData.summary.total_responses,
      questions: formattedQuestions
    };

    // Validate Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const context = `
      Analyze this survey data and provide insights based on the following prompt:
      ${promptText}

      Survey Data:
      ${JSON.stringify(formattedData, null, 2)}

      Please focus on:
      1. Overall response patterns and trends
      2. Key insights from each question type
      3. Notable findings and recommendations
      4. Areas that might need attention
    `;

    console.log("Generating analysis...");
    const result = await model.generateContent(context);
    const response = result.response;
    const formattedText = response.text().replace(/\n/g, '<br>');

    console.log("Analysis completed successfully");
    return new Response(
      JSON.stringify({ content: formattedText }),
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
      JSON.stringify({ error: error.message }),
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
