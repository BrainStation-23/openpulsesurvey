
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "../../types";
import { QuestionData, QuestionResponseData } from "./types";

/**
 * Fetches all data needed for PPTX generation using optimized RPC calls
 */
export const fetchPresentationData = async (
  campaign: CampaignData,
  instanceId: string | undefined,
  dimensions: string[],
  excludeQuestionTypes: string[] = ["text", "comment"],
  onlyIncludeQuestions: string[] = []
): Promise<QuestionResponseData[]> {
  if (!campaign) throw new Error("Campaign data is required");

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
    
    // Fetch main data for the question
    let mainData: any;
    if (isBoolean) {
      const { data, error } = await supabase.rpc(
        'get_dimension_bool',
        {
          p_campaign_id: campaign.id,
          p_instance_id: instanceId || campaign.instance?.id,
          p_question_name: question.name,
          p_dimension: 'none' // Use 'none' for aggregated data
        }
      );
      if (error) throw error;
      mainData = data;
    } else if (isNps) {
      const { data, error } = await supabase.rpc(
        'get_dimension_nps',
        {
          p_campaign_id: campaign.id,
          p_instance_id: instanceId || campaign.instance?.id,
          p_question_name: question.name,
          p_dimension: 'none'
        }
      );
      if (error) throw error;
      mainData = data;
    } else {
      const { data, error } = await supabase.rpc(
        'get_dimension_satisfaction',
        {
          p_campaign_id: campaign.id,
          p_instance_id: instanceId || campaign.instance?.id,
          p_question_name: question.name,
          p_dimension: 'none'
        }
      );
      if (error) throw error;
      mainData = data;
    }

    // Fetch dimension data for the question
    const dimensionData: Record<string, any[]> = {};
    for (const dimension of dimensions) {
      if (isBoolean) {
        const { data, error } = await supabase.rpc(
          'get_dimension_bool',
          {
            p_campaign_id: campaign.id,
            p_instance_id: instanceId || campaign.instance?.id,
            p_question_name: question.name,
            p_dimension: dimension
          }
        );
        if (error) throw error;
        dimensionData[dimension] = data;
      } else if (isNps) {
        const { data, error } = await supabase.rpc(
          'get_dimension_nps',
          {
            p_campaign_id: campaign.id,
            p_instance_id: instanceId || campaign.instance?.id,
            p_question_name: question.name,
            p_dimension: dimension
          }
        );
        if (error) throw error;
        dimensionData[dimension] = data;
      } else {
        const { data, error } = await supabase.rpc(
          'get_dimension_satisfaction',
          {
            p_campaign_id: campaign.id,
            p_instance_id: instanceId || campaign.instance?.id,
            p_question_name: question.name,
            p_dimension: dimension
          }
        );
        if (error) throw error;
        dimensionData[dimension] = data;
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
