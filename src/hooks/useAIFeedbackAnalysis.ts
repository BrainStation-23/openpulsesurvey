
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

interface AIAnalysisMetadata {
  team_size: number;
  response_rate: number;
  generated_at: string;
}

export const useAIFeedbackAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AIAnalysisMetadata | null>(null);
  const { user, isLoading: userLoading } = useCurrentUser();

  const fetchExistingAnalysis = async (campaignId?: string, instanceId?: string) => {
    console.log('fetchExistingAnalysis called with:', { 
      campaignId, 
      instanceId, 
      userId: user?.id, 
      userLoading 
    });

    // Wait for user to load first
    if (userLoading) {
      console.log('User still loading, skipping fetch');
      return;
    }

    if (!user?.id) {
      console.log('No user found, clearing analysis');
      setAnalysis(null);
      setMetadata(null);
      return;
    }

    if (!campaignId || !instanceId) {
      console.log('Missing campaignId or instanceId, clearing analysis');
      setAnalysis(null);
      setMetadata(null);
      return;
    }

    console.log('Starting analysis fetch for:', { campaignId, instanceId, supervisorId: user.id });
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('ai_feedback_analysis')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('instance_id', instanceId)
        .eq('supervisor_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing analysis found - this is normal');
          setAnalysis(null);
          setMetadata(null);
        } else {
          console.error('Database error fetching analysis:', error);
          setAnalysis(null);
          setMetadata(null);
        }
        return;
      }

      console.log('Successfully found existing analysis:', { 
        id: data.id, 
        teamSize: data.team_size, 
        responseRate: data.response_rate 
      });
      setAnalysis(data.analysis_content);
      setMetadata({
        team_size: data.team_size,
        response_rate: data.response_rate,
        generated_at: data.generated_at
      });
    } catch (error) {
      console.error('Unexpected error fetching existing analysis:', error);
      setAnalysis(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    console.log('Clearing analysis state');
    setAnalysis(null);
    setMetadata(null);
  };

  return {
    fetchExistingAnalysis,
    clearAnalysis,
    isLoading,
    analysis,
    metadata,
    userLoading
  };
};
