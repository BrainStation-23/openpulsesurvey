
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
  
  // First fetch available campaigns
  const { data: availableCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['available-campaigns'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get all active campaigns
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select('id, name')
        .neq('status', 'draft')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Fetch trend data for the selected campaign
  const { data, isLoading: isLoadingTrend, error, refetch } = useQuery({
    queryKey: ['team-feedback-trend', user?.id, campaignId, selectedQuestionName],
    queryFn: async (): Promise<TeamFeedbackTrendResponse> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
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
        
        // Parse the response and ensure it has the correct shape
        const result = responseData as unknown as TeamFeedbackTrendResponse;
        
        // Ensure data property is correctly initialized
        if (result.data) {
          // Ensure instances array is initialized
          if (!result.data.instances) {
            result.data.instances = [];
          }
          
          // Ensure questions array is initialized
          if (!result.data.questions) {
            result.data.questions = [];
          } else {
            // Ensure each question has trend_data initialized
            result.data.questions = result.data.questions.map(question => ({
              ...question,
              trend_data: question.trend_data || []
            }));
          }
        } else {
          // Initialize data with empty arrays if it doesn't exist
          result.data = {
            instances: [],
            questions: []
          };
        }
        
        return result;
      } catch (err) {
        console.error('Error fetching trend data:', err);
        return { 
          status: 'error', 
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          data: {
            instances: [],
            questions: []
          }
        };
      }
    },
    enabled: !!user?.id && !!campaignId,
  });
  
  return {
    trendData: data,
    isLoading: isLoadingTrend,
    isLoadingCampaigns,
    availableCampaigns,
    error,
    refetch,
    selectedQuestionName,
    setSelectedQuestionName
  };
};
