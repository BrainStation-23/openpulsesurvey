
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export interface TeamFeedbackTrendData {
  instances: {
    id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
  }[];
  questions: {
    question_name: string;
    question_title: string;
    question_type: string;
    trend_data: {
      instance_id: string;
      period_number: number;
      avg_value: number | null;
      yes_percentage?: number;
      response_count: number;
    }[];
  }[];
}

export interface TeamFeedbackTrendResponse {
  status: string;
  data?: TeamFeedbackTrendData;
  message?: string;
}

export const useTeamFeedbackTrend = (campaignId?: string) => {
  const { user } = useCurrentUser();
  const [selectedQuestionName, setSelectedQuestionName] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['team-feedback-trend', user?.id, campaignId, selectedQuestionName],
    queryFn: async (): Promise<TeamFeedbackTrendResponse> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Use the existing RPC function but format the result for trend visualization
      const { data: responseData, error } = await supabase.rpc(
        'get_supervisor_team_feedback',
        {
          p_campaign_id: campaignId || null,
          p_instance_id: null, // We pass null to get data for all instances
          p_supervisor_id: user.id,
          p_question_name: selectedQuestionName || null
        }
      );
      
      if (error) throw error;
      
      // Make sure data isn't null
      if (!responseData) {
        return { status: 'error', message: 'No data returned from the server' };
      }
      
      // Process the data for trend visualization if it's successful
      if (responseData.status === 'success' && responseData.data) {
        // Transform the data for trends
        const transformedData = transformDataForTrend(responseData.data);
        return {
          status: 'success',
          data: transformedData
        };
      }
      
      // Return original response if not successful
      return responseData as TeamFeedbackTrendResponse;
    },
    enabled: !!user?.id && !!campaignId,
  });
  
  const transformDataForTrend = (originalData: any): TeamFeedbackTrendData => {
    // Group the data by instances
    const instances = originalData.instances || [];
    const questions = [];
    
    // Filter non-text questions and prepare trend data
    if (originalData.questions && Array.isArray(originalData.questions)) {
      for (const question of originalData.questions) {
        if (question.question_type !== 'text' && question.question_type !== 'comment') {
          const trendData = instances.map(instance => ({
            instance_id: instance.id,
            period_number: instance.period_number,
            avg_value: question.avg_value,
            yes_percentage: question.question_type === 'boolean' ? 
              (question.yes_count / (question.yes_count + question.no_count) * 100) : undefined,
            response_count: question.response_count || 0
          }));
          
          questions.push({
            question_name: question.question_name,
            question_title: question.question_title,
            question_type: question.question_type,
            trend_data: trendData
          });
        }
      }
    }
    
    return {
      instances,
      questions
    };
  };
  
  return {
    trendData: data,
    isLoading,
    error,
    refetch,
    selectedQuestionName,
    setSelectedQuestionName
  };
};
