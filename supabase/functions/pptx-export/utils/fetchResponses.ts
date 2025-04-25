
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cleanText } from "./helpers.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuestionInfo {
  name: string;
  type: string;
  rateMax?: number;
  title: string;
}

export interface SurveyData {
  id: string;
  name: string;
  description: string | null;
  json_data: {
    pages?: Array<{
      elements?: Array<QuestionInfo>;
    }>;
  };
}

export interface CampaignData {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  completion_rate: number | null;
  survey: SurveyData;
  instance?: {
    id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
    status: string;
    completion_rate: number;
  };
}

// Get all survey questions by type
export function getQuestionsByType(surveyData: SurveyData): {
  npsQuestions: QuestionInfo[];
  satisfactionQuestions: QuestionInfo[];
  booleanQuestions: QuestionInfo[];
  textQuestions: QuestionInfo[];
} {
  const questions: QuestionInfo[] = [];
  
  // Extract all questions from survey data
  surveyData.json_data.pages?.forEach(page => {
    page.elements?.forEach(element => {
      if (element.name && element.type) {
        questions.push(element);
      }
    });
  });
  
  // Categorize questions by type
  return {
    npsQuestions: questions.filter(q => q.type === 'rating' && q.rateMax === 10),
    satisfactionQuestions: questions.filter(q => q.type === 'rating' && (!q.rateMax || q.rateMax === 5)),
    booleanQuestions: questions.filter(q => q.type === 'boolean'),
    textQuestions: questions.filter(q => q.type === 'text' || q.type === 'comment')
  };
}

export async function fetchCampaignData(campaignId: string, instanceId: string | null): Promise<CampaignData> {
  try {
    const { data, error } = await supabase
      .from("survey_campaigns")
      .select(`
        id,
        name,
        description,
        starts_at,
        ends_at,
        completion_rate,
        survey:surveys (
          id,
          name,
          description,
          json_data
        )
      `)
      .eq("id", campaignId)
      .single();

    if (error) {
      console.error(`Error fetching campaign data: ${JSON.stringify(error)}`);
      throw error;
    }

    let instance = null;
    if (instanceId) {
      const { data: instanceData, error: instanceError } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("id", instanceId)
        .single();

      if (instanceError) {
        console.error(`Error fetching instance data: ${JSON.stringify(instanceError)}`);
        throw instanceError;
      }
      instance = instanceData;
    }

    return {
      ...data,
      instance,
      survey: {
        ...data.survey,
        json_data: typeof data.survey.json_data === 'string' 
          ? JSON.parse(data.survey.json_data) 
          : data.survey.json_data
      }
    };
  } catch (err) {
    console.error(`Exception in fetchCampaignData: ${err.message || err}`);
    throw err;
  }
}

// Generic function to fetch responses for any question type
export async function fetchResponsesManually(campaignId: string, instanceId: string | null, questionName: string) {
  try {
    console.log(`Fetching responses for question: ${questionName}, campaign: ${campaignId}, instance: ${instanceId || 'all'}`);
    
    const { data: assignments, error: assignmentsError } = await supabase
      .from("survey_assignments")
      .select("id")
      .eq("campaign_id", campaignId);
    
    if (assignmentsError) {
      console.error(`Error fetching assignments: ${JSON.stringify(assignmentsError)}`);
      throw assignmentsError;
    }
    
    if (!assignments || assignments.length === 0) {
      console.log(`No assignments found for campaign ${campaignId}`);
      return [];
    }
    
    const assignmentIds = assignments.map(a => a.id);
    let query = supabase
      .from("survey_responses")
      .select(`submitted_at, response_data`)
      .eq("status", "submitted")
      .in("assignment_id", assignmentIds);
    
    if (instanceId) {
      query = query.eq("campaign_instance_id", instanceId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching responses: ${JSON.stringify(error)}`);
      throw error;
    }

    // For time-series data, return submission timestamps
    if (questionName === 'submitted_at') {
      return data.map(r => r.submitted_at);
    }
    
    // For question data, extract responses for the specific question
    const extractedResponses = data
      .map(r => r.response_data[questionName])
      .filter(r => r !== undefined && r !== null);
    
    console.log(`Found ${extractedResponses.length} responses for question ${questionName}`);
    return extractedResponses;
  } catch (error) {
    console.error(`Error in fetchResponsesManually: ${error}`);
    return [];
  }
}

export async function fetchBooleanResponses(campaignId: string, instanceId: string | null, questionName: string) {
  try {
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    const yesCount = responses.filter(r => 
      r === true || 
      r === 1 || 
      r === '1' || 
      (typeof r === 'string' && (r.toLowerCase() === 'true' || r.toLowerCase() === 'yes'))
    ).length;
    
    return {
      yes: yesCount,
      no: responses.length - yesCount
    };
  } catch (error) {
    console.error(`Error in fetchBooleanResponses: ${error}`);
    return { yes: 0, no: 0 };
  }
}

export async function fetchNpsResponses(campaignId: string, instanceId: string | null, questionName: string) {
  try {
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    const validResponses = responses
      .map(r => typeof r === 'string' ? parseInt(r, 10) : (typeof r === 'number' ? r : NaN))
      .filter(r => !isNaN(r) && r >= 0 && r <= 10);
    
    const detractors = validResponses.filter(r => r <= 6).length;
    const passives = validResponses.filter(r => r >= 7 && r <= 8).length;
    const promoters = validResponses.filter(r => r >= 9).length;
    const total = validResponses.length;
    
    let npsScore = 0;
    let avgScore = 0;
    
    if (total > 0) {
      npsScore = ((promoters / total) - (detractors / total)) * 100;
      avgScore = validResponses.reduce((sum, val) => sum + val, 0) / total;
    }
    
    console.log(`NPS result for ${questionName}: D=${detractors}, P=${passives}, Pr=${promoters}, Total=${total}, Score=${npsScore.toFixed(1)}`);
    
    return {
      detractors,
      passives,
      promoters,
      total,
      nps_score: npsScore,
      avg_score: avgScore
    };
  } catch (error) {
    console.error(`Error in fetchNpsResponses: ${error}`);
    return {
      detractors: 0,
      passives: 0,
      promoters: 0,
      total: 0,
      nps_score: 0,
      avg_score: 0
    };
  }
}

export async function fetchRatingResponses(campaignId: string, instanceId: string | null, questionName: string) {
  try {
    const responses = await fetchResponsesManually(campaignId, instanceId, questionName);
    
    const validResponses = responses
      .map(r => typeof r === 'string' ? parseInt(r, 10) : (typeof r === 'number' ? r : NaN))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);
    
    const unsatisfied = validResponses.filter(r => r <= 2).length;
    const neutral = validResponses.filter(r => r === 3).length;
    const satisfied = validResponses.filter(r => r >= 4).length;
    const total = validResponses.length;
    
    let median = 0;
    if (validResponses.length > 0) {
      const sorted = [...validResponses].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      
      if (sorted.length % 2 === 0) {
        median = (sorted[middle - 1] + sorted[middle]) / 2;
      } else {
        median = sorted[middle];
      }
    }
    
    console.log(`Rating results for ${questionName}: Unsat=${unsatisfied}, Neutral=${neutral}, Sat=${satisfied}, Total=${total}`);
    
    return {
      unsatisfied,
      neutral,
      satisfied,
      total,
      median
    };
  } catch (error) {
    console.error(`Error in fetchRatingResponses: ${error}`);
    return {
      unsatisfied: 0,
      neutral: 0,
      satisfied: 0,
      total: 0,
      median: 0
    };
  }
}

// Fetch dimension data using RPC functions
export async function fetchDimensionComparisonData(
  campaignId: string, 
  instanceId: string, 
  questionName: string, 
  dimension: string, 
  questionType: string
) {
  try {
    console.log(`Fetching dimension data for: ${questionName}, dimension: ${dimension}, type: ${questionType}`);
    
    if (questionType === 'boolean') {
      const { data, error } = await supabase.rpc(
        'get_dimension_bool',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimension
        }
      );
      if (error) {
        console.error(`Error in get_dimension_bool RPC: ${JSON.stringify(error)}`);
        throw error;
      }
      console.log(`Bool dimension result count: ${data?.length || 0}`);
      return data;
    } 
    
    if (questionType === 'nps') {
      const { data, error } = await supabase.rpc(
        'get_dimension_nps',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimension
        }
      );
      if (error) {
        console.error(`Error in get_dimension_nps RPC: ${JSON.stringify(error)}`);
        throw error;
      }
      console.log(`NPS dimension result count: ${data?.length || 0}`);
      return data;
    }
    
    // Default to satisfaction (rating 1-5)
    const { data, error } = await supabase.rpc(
      'get_dimension_satisfaction',
      {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_question_name: questionName,
        p_dimension: dimension
      }
    );
    if (error) {
      console.error(`Error in get_dimension_satisfaction RPC: ${JSON.stringify(error)}`);
      throw error;
    }
    console.log(`Satisfaction dimension result count: ${data?.length || 0}`);
    return data;
  } catch (error) {
    console.error(`Error fetching dimension comparison data: ${error}`);
    return [];
  }
}
