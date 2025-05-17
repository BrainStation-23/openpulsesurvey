
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export interface TeamFeedbackQuestion {
  question_name: string;
  question_title: string;
  question_type: string;
  response_count: number;
  avg_value: number | null;
  distribution: any;
}

export interface TeamFeedbackData {
  questions: TeamFeedbackQuestion[];
  team_size: number;
  response_count: number;
  response_rate: number;
  campaign_info?: {
    campaign_id: string;
    campaign_name: string;
    instance_id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
  };
}

export interface TeamFeedbackResponse {
  status: string;
  data?: TeamFeedbackData;
  message?: string;
}

export const useReporteeFeedback = (campaignId?: string, instanceId?: string) => {
  const { user } = useCurrentUser();
  const [selectedQuestionName, setSelectedQuestionName] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reportee-feedback', user?.id, campaignId, instanceId, selectedQuestionName],
    queryFn: async (): Promise<TeamFeedbackResponse> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc(
        'get_supervisor_team_feedback',
        {
          p_campaign_id: campaignId || null,
          p_instance_id: instanceId || null,
          p_supervisor_id: user.id,
          p_question_name: selectedQuestionName || null
        }
      );
      
      if (error) throw error;
      
      // Make sure data isn't null before returning
      if (!data) {
        return { status: 'error', message: 'No data returned from the server' };
      }
      
      // Apply type assertion to fix the TypeScript error
      return data as unknown as TeamFeedbackResponse;
    },
    enabled: !!user?.id,
  });
  
  return {
    feedbackData: data,
    isLoading,
    error,
    refetch,
    selectedQuestionName,
    setSelectedQuestionName
  };
};
