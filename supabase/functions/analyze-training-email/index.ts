
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

interface GradingCriteria {
  id: string;
  name: string;
  max_points: number;
  status: 'active' | 'inactive';
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

    // Fetch active grading criteria
    const { data: gradingCriteria, error: criteriaError } = await supabaseClient
      .from('grading_criteria')
      .select('*')
      .eq('status', 'active')

    if (criteriaError) throw criteriaError

    if (!gradingCriteria || gradingCriteria.length === 0) {
      throw new Error('No active grading criteria found')
    }

    const { sessionId, responseId, originalEmail, userResponse, attemptNumber } = await req.json() as EmailAnalysisRequest

    // Construct the grading criteria prompt dynamically
    const criteriaPrompt = gradingCriteria
      .map(criteria => `- ${criteria.name} (0-${criteria.max_points}): ${criteria.name}`)
      .join('\n')

    const totalMaxPoints = gradingCriteria.reduce((sum, criteria) => sum + criteria.max_points, 0)

    // Build the grading prompt using the dynamic criteria
    const gradingPrompt = `
      Analyze and grade this email response based on the following criteria:
      ${criteriaPrompt}
      
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
          ${gradingCriteria.map(c => `"${c.name.toLowerCase().replace(/\s+/g, '_')}": number`).join(',\n          ')},
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

    // Generate AI response based on the score percentage
    const scorePercentage = (analysis.scores.total_score / totalMaxPoints) * 100
    const responsePrompt = `
      You are the original sender of this email chain. Generate a response to the user's email.
      The response should be natural and reflect whether you are satisfied with their response.
      Base your satisfaction on their score of ${analysis.scores.total_score}/${totalMaxPoints} (${scorePercentage.toFixed(1)}%).
      
      Original Email:
      ${originalEmail.content}
      
      Their Response:
      ${userResponse.content}
      
      Respond naturally as the original sender. If their score is below 75%, express some dissatisfaction
      or ask for clarification. If their score is above 75%, express satisfaction.
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

    // Store the results
    const { data: gradeData, error: gradeError } = await supabaseClient
      .from('email_response_grades')
      .insert({
        response_id: responseId,
        attempt_number: attemptNumber,
        grading_data: analysis,
        ai_analysis: analysis.analysis.detailed_feedback,
        ai_response: aiResponseText,
        client_satisfaction: scorePercentage >= 75
      })
      .select()
      .single()

    if (gradeError) throw gradeError

    // If this is the final attempt or score is very high, store the final results
    if (attemptNumber === 3 || scorePercentage >= 87.5) {
      const { data: gradesData, error: gradesError } = await supabaseClient
        .from('email_response_grades')
        .select('grading_data')
        .eq('response_id', responseId)

      if (gradesError) throw gradesError

      const finalScore = gradesData.reduce((acc, grade) => {
        const totalScore = Object.values(grade.grading_data.scores)
          .reduce((sum: number, score: number) => {
            if (typeof score === 'number' && score !== grade.grading_data.scores.total_score) {
              return sum + score;
            }
            return sum;
          }, 0);
        return acc + totalScore;
      }, 0) / gradesData.length

      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('email_training_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      const { error: resultError } = await supabaseClient
        .from('email_training_results')
        .insert({
          session_id: sessionId,
          user_id: sessionData.user_id,
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
        isComplete: attemptNumber === 3 || scorePercentage >= 87.5
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
