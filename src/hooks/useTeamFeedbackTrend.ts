
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
      
      // Use our new RPC function designed for trend visualization
      const { data: responseData, error } = await supabase.rpc(
        'get_supervisor_team_trend',
        {
          p_campaign_id: campaignId || null,
          p_supervisor_id: user.id,
          p_question_name: selectedQuestionName || null
        }
      );
      
      if (error) throw error;
      
      // Make sure data isn't null
      if (!responseData) {
        return { status: 'error', message: 'No data returned from the server' };
      }
      
      // Parse the response as our TeamFeedbackTrendResponse type
      return responseData as TeamFeedbackTrendResponse;
    },
    enabled: !!user?.id && !!campaignId,
  });
  
  return {
    trendData: data,
    isLoading,
    error,
    refetch,
    selectedQuestionName,
    setSelectedQuestionName
  };
};
