
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "../../types";
import { QuestionData, QuestionResponseData } from "./types";

/**
 * Fetches all data needed for PPTX generation with improved error handling and fallbacks
 */
export const fetchPresentationData = async (
  campaign: CampaignData,
  instanceId: string | undefined,
  dimensions: string[],
  excludeQuestionTypes: string[] = ["text", "comment"],
  onlyIncludeQuestions: string[] = []
): Promise<QuestionResponseData[]> => {
  if (!campaign) throw new Error("Campaign data is required");

  // Ensure instanceId is valid
  const validInstanceId = instanceId || campaign.instance?.id;
  if (!validInstanceId) {
    throw new Error("No valid instance ID available");
  }

  // Parse survey structure to get questions
  const surveyData = typeof campaign.survey?.json_data === 'string'
    ? JSON.parse(campaign.survey.json_data)
    : campaign.survey.json_data;

  // Extract all questions from survey
  const allQuestions = (surveyData?.pages || [])
    .flatMap((page: any) => page.elements || [])
    .map((q: any) => ({
      name: q.name,
      title: q.title || q.name,
      type: q.type,
      rateCount: q.rateMax === 10 ? 10 : (q.rateMax || 5)
    }));

  // Filter questions based on configuration
  const filteredQuestions = allQuestions.filter((q: QuestionData) => {
    // Skip excluded question types
    if (excludeQuestionTypes.includes(q.type)) return false;
    
    // If specific questions are specified, only include those
    if (onlyIncludeQuestions.length > 0 && !onlyIncludeQuestions.includes(q.name)) return false;
    
    return true;
  });

  // Prepare to fetch data for each question
  const questionDataPromises = filteredQuestions.map(async (question: QuestionData) => {
    const isNps = question.type === "rating" && question.rateCount === 10;
    const isBoolean = question.type === "boolean";
    
    // Fetch main data for the question using a try/catch with fallback mechanism
    let mainData = await fetchMainData(campaign.id, validInstanceId, question.name, isNps, isBoolean);

    // Fetch dimension data for the question
    const dimensionData: Record<string, any[]> = {};
    
    for (const dimension of dimensions) {
      try {
        // Skip invalid dimensions
        if (!dimension || dimension === 'none') continue;
        
        // Attempt to fetch dimension data
        if (isBoolean) {
          const data = await fetchBooleanDimensionData(campaign.id, validInstanceId, question.name, dimension);
          dimensionData[dimension] = data;
        } else if (isNps) {
          const data = await fetchNpsDimensionData(campaign.id, validInstanceId, question.name, dimension);
          dimensionData[dimension] = data;
        } else {
          const data = await fetchSatisfactionDimensionData(campaign.id, validInstanceId, question.name, dimension);
          dimensionData[dimension] = data;
        }
      } catch (error) {
        console.error(`Error fetching dimension data for ${dimension}:`, error);
        // In case of error, set empty array for this dimension
        dimensionData[dimension] = [];
      }
    }

    return {
      questionData: question,
      mainData,
      dimensionData
    };
  });

  // Execute all data fetching in parallel
  return Promise.all(questionDataPromises);
};

/**
 * Fallback mechanism for fetching main data when RPC fails
 */
async function fetchMainData(
  campaignId: string,
  instanceId: string, 
  questionName: string, 
  isNps: boolean, 
  isBoolean: boolean
) {
  try {
    // First try the RPC approach (which might fail if functions aren't properly exposed)
    if (isBoolean) {
      const { data, error } = await supabase.rpc(
        'get_dimension_bool',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: 'all' // Use 'all' instead of 'none'
        }
      );
      
      if (!error) return data;
      throw error;
    } else if (isNps) {
      const { data, error } = await supabase.rpc(
        'get_dimension_nps',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: 'all' // Use 'all' instead of 'none'
        }
      );
      
      if (!error) return data;
      throw error;
    } else {
      const { data, error } = await supabase.rpc(
        'get_dimension_satisfaction',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: 'all' // Use 'all' instead of 'none'
        }
      );
      
      if (!error) return data;
      throw error;
    }
  } catch (rpcError) {
    console.warn("RPC function call failed, falling back to direct data fetching:", rpcError);
    
    // Direct query fallback
    try {
      // Fetch all responses for this question
      const { data: responses, error: responsesError } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          user:profiles!survey_responses_user_id_fkey (
            id
          )
        `)
        .eq("campaign_instance_id", instanceId);
      
      if (responsesError) throw responsesError;
      
      // Process the data according to question type
      if (isBoolean) {
        let yesCount = 0;
        let noCount = 0;
        
        responses.forEach(response => {
          const answer = response.response_data[questionName];
          if (answer === true) yesCount++;
          if (answer === false) noCount++;
        });
        
        return [{
          dimension: "All Responses",
          yes_count: yesCount,
          no_count: noCount,
          total_count: yesCount + noCount
        }];
      } else if (isNps) {
        let detractors = 0;
        let passives = 0;
        let promoters = 0;
        let totalRatings = 0;
        let sumRatings = 0;
        
        responses.forEach(response => {
          const rating = response.response_data[questionName];
          if (typeof rating !== 'number') return;
          
          totalRatings++;
          sumRatings += rating;
          
          if (rating <= 6) detractors++;
          else if (rating <= 8) passives++;
          else promoters++;
        });
        
        const npsScore = totalRatings > 0 
          ? ((promoters - detractors) / totalRatings) * 100 
          : 0;
        
        return [{
          dimension: "All Responses",
          detractors,
          passives,
          promoters,
          total: totalRatings,
          nps_score: npsScore,
          avg_score: totalRatings > 0 ? sumRatings / totalRatings : 0
        }];
      } else {
        // For satisfaction (1-5 rating)
        let unsatisfied = 0;
        let neutral = 0;
        let satisfied = 0;
        let total = 0;
        let sumRatings = 0;
        
        responses.forEach(response => {
          const rating = response.response_data[questionName];
          if (typeof rating !== 'number') return;
          
          total++;
          sumRatings += rating;
          
          if (rating <= 2) unsatisfied++;
          else if (rating === 3) neutral++;
          else satisfied++;
        });
        
        return [{
          dimension: "All Responses",
          unsatisfied,
          neutral,
          satisfied,
          total,
          avg_score: total > 0 ? sumRatings / total : 0
        }];
      }
    } catch (fallbackError) {
      console.error("Fallback data fetching also failed:", fallbackError);
      // Return empty data structure as last resort
      if (isBoolean) {
        return [{ dimension: "All Responses", yes_count: 0, no_count: 0, total_count: 0 }];
      } else if (isNps) {
        return [{ dimension: "All Responses", detractors: 0, passives: 0, promoters: 0, total: 0, nps_score: 0, avg_score: 0 }];
      } else {
        return [{ dimension: "All Responses", unsatisfied: 0, neutral: 0, satisfied: 0, total: 0, avg_score: 0 }];
      }
    }
  }
}

/**
 * Helper functions to fetch dimension data with proper error handling
 */
async function fetchBooleanDimensionData(campaignId: string, instanceId: string, questionName: string, dimension: string) {
  try {
    const { data, error } = await supabase.rpc(
      'get_dimension_bool',
      {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_question_name: questionName,
        p_dimension: dimension
      }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching boolean dimension data for ${dimension}:`, error);
    return [];
  }
}

async function fetchNpsDimensionData(campaignId: string, instanceId: string, questionName: string, dimension: string) {
  try {
    const { data, error } = await supabase.rpc(
      'get_dimension_nps',
      {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_question_name: questionName,
        p_dimension: dimension
      }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching NPS dimension data for ${dimension}:`, error);
    return [];
  }
}

async function fetchSatisfactionDimensionData(campaignId: string, instanceId: string, questionName: string, dimension: string) {
  try {
    const { data, error } = await supabase.rpc(
      'get_dimension_satisfaction',
      {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_question_name: questionName,
        p_dimension: dimension
      }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching satisfaction dimension data for ${dimension}:`, error);
    return [];
  }
}
