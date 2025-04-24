
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textResponses, metadata } = await req.json();
    
    if (!textResponses || !Array.isArray(textResponses) || textResponses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text responses provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const modelName = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-pro';
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Process responses in batches to prevent context window overflow
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < textResponses.length; i += batchSize) {
      batches.push(textResponses.slice(i, i + batchSize));
    }

    // Set up the prompt for sentiment analysis
    const systemPrompt = `
      Analyze the following survey responses for sentiment. For each response:
      1. Assign a sentiment score from 0-100 where:
         - 0-60: Negative
         - 60-80: Neutral
         - 80-100: Positive
      2. Identify key themes or topics mentioned.
      3. Assess the confidence level of your sentiment analysis from 0-100.
      
      Provide your analysis in JSON format with the following structure for each response:
      {
        "sentiment_score": number,
        "sentiment_category": "negative" | "neutral" | "positive",
        "confidence": number,
        "key_themes": string[],
        "response_text": string
      }
      
      Return an array of these JSON objects, one for each response.
    `;

    // Process each batch
    const allResults = [];
    
    for (const batch of batches) {
      const batchText = batch.join('\n\n---\n\n');
      const prompt = `${systemPrompt}\n\nResponses to analyze:\n${batchText}`;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      try {
        // Extract JSON from response (handling potential text wrapping)
        const jsonStr = responseText.replace(/```json|```/g, '').trim();
        const parsedResults = JSON.parse(jsonStr);
        
        if (Array.isArray(parsedResults)) {
          allResults.push(...parsedResults);
        } else {
          allResults.push(parsedResults);
        }
      } catch (e) {
        console.error('Error parsing AI response:', e);
        console.log('Raw response:', responseText);
        
        // Fallback: create simple sentiment objects
        for (const response of batch) {
          allResults.push({
            sentiment_score: 70, // Default neutral
            sentiment_category: "neutral",
            confidence: 50,
            key_themes: ["could not analyze"],
            response_text: response
          });
        }
      }
    }

    // Calculate aggregate statistics
    const aggregateData = {
      average_sentiment: allResults.reduce((sum, item) => sum + item.sentiment_score, 0) / allResults.length,
      sentiment_distribution: {
        positive: allResults.filter(r => r.sentiment_category === "positive").length,
        neutral: allResults.filter(r => r.sentiment_category === "neutral").length,
        negative: allResults.filter(r => r.sentiment_category === "negative").length,
      },
      confidence_average: allResults.reduce((sum, item) => sum + item.confidence, 0) / allResults.length,
      
      // Extract common themes
      themes: extractCommonThemes(allResults),
      
      // Add metadata
      metadata: metadata || {}
    };

    return new Response(
      JSON.stringify({ 
        individual_analysis: allResults,
        aggregate_data: aggregateData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract common themes
function extractCommonThemes(results: any[]): {theme: string, count: number}[] {
  const themeCounts: {[key: string]: number} = {};
  
  results.forEach(result => {
    if (result.key_themes && Array.isArray(result.key_themes)) {
      result.key_themes.forEach((theme: string) => {
        const normalizedTheme = theme.toLowerCase().trim();
        themeCounts[normalizedTheme] = (themeCounts[normalizedTheme] || 0) + 1;
      });
    }
  });
  
  // Convert to array and sort by frequency
  return Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Return top 10 themes
}
