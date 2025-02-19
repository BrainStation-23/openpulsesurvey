
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailAnalysisRequest {
  sessionId: string;
  responseId: string;
  originalEmail: {
    subject: string;
    content: string;
    key_points?: string[];
  };
  userResponse: {
    subject: string;
    content: string;
  };
  attemptNumber: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionId, responseId, originalEmail, userResponse, attemptNumber } = await req.json() as EmailAnalysisRequest

    // 1. Analyze and grade the email
    const gradingPrompt = `
      Analyze and grade this email response based on the following criteria:
      - Professionalism (0-10): Formal language, appropriate tone
      - Completeness (0-10): Addresses all points from the original email
      - Clarity (0-10): Clear and concise communication
      - Solution Quality (0-10): Effectiveness of proposed solutions
      
      Original Email:
      Subject: ${originalEmail.subject}
      Content: ${originalEmail.content}
      ${originalEmail.key_points ? `Key Points: ${originalEmail.key_points.join(", ")}` : ""}
      
      User Response:
      Subject: ${userResponse.subject}
      Content: ${userResponse.content}
      
      Provide your analysis in JSON format with the following structure:
      {
        "scores": {
          "professionalism": number,
          "completeness": number,
          "clarity": number,
          "solution_quality": number,
          "total_score": number
        },
        "analysis": {
          "strengths": string[],
          "areas_for_improvement": string[],
          "detailed_feedback": string
        }
      }
    `

    const gradingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert email communication coach.' },
          { role: 'user', content: gradingPrompt }
        ],
      }),
    })

    const gradingData = await gradingResponse.json()
    const analysis = JSON.parse(gradingData.choices[0].message.content)

    // 2. Generate AI response based on user's email
    const responsePrompt = `
      You are the original sender of this email chain. Generate a response to the user's email.
      The response should be natural and reflect whether you are satisfied with their response.
      Base your satisfaction on their score of ${analysis.scores.total_score}/40.
      
      Original Email:
      ${originalEmail.content}
      
      Their Response:
      ${userResponse.content}
      
      Respond naturally as the original sender. If their score is below 30, express some dissatisfaction
      or ask for clarification. If their score is above 30, express satisfaction.
      Keep the chain going if this is not the final attempt (current attempt: ${attemptNumber}/3).
      If this is the final attempt, bring the conversation to a conclusion.
    `

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are the original email sender responding to a business email.' },
          { role: 'user', content: responsePrompt }
        ],
      }),
    })

    const aiResponseData = await aiResponse.json()
    const aiResponseText = aiResponseData.choices[0].message.content

    // 3. Store the results
    const { data: gradeData, error: gradeError } = await supabaseClient
      .from('email_response_grades')
      .insert({
        response_id: responseId,
        attempt_number: attemptNumber,
        grading_data: analysis,
        ai_analysis: analysis.analysis.detailed_feedback,
        ai_response: aiResponseText,
        client_satisfaction: analysis.scores.total_score >= 30
      })
      .select()
      .single()

    if (gradeError) throw gradeError

    // 4. If this is the final attempt, store the final results
    if (attemptNumber === 3 || analysis.scores.total_score >= 35) {
      const { data: gradesData, error: gradesError } = await supabaseClient
        .from('email_response_grades')
        .select('grading_data')
        .eq('response_id', responseId)

      if (gradesError) throw gradesError

      const finalScore = gradesData.reduce((acc, grade) => {
        const scores = grade.grading_data.scores
        return acc + scores.total_score
      }, 0) / gradesData.length

      const { error: resultError } = await supabaseClient
        .from('email_training_results')
        .insert({
          session_id: sessionId,
          user_id: (await supabaseClient
            .from('email_training_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .single()).data?.user_id,
          final_score: finalScore,
          total_attempts: attemptNumber,
          improvement_notes: analysis.analysis.areas_for_improvement.join(". ")
        })

      if (resultError) throw resultError
    }

    return new Response(
      JSON.stringify({
        grade: analysis,
        aiResponse: aiResponseText,
        isComplete: attemptNumber === 3 || analysis.scores.total_score >= 35
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
