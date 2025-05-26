
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';

interface AIAnalysisMetadata {
  team_size: number;
  response_rate: number;
  generated_at: string;
}

interface StoredAIAnalysis {
  id: string;
  analysis_content: string;
  team_size: number;
  response_rate: number;
  generated_at: string;
}

export const useAIFeedbackAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AIAnalysisMetadata | null>(null);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const fetchExistingAnalysis = async (campaignId?: string, instanceId?: string) => {
    if (!user?.id || !campaignId || !instanceId) return null;

    try {
      const { data, error } = await supabase
        .from('ai_feedback_analysis')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('instance_id', instanceId)
        .eq('supervisor_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching existing analysis:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching existing analysis:', error);
      return null;
    }
  };

  const saveAnalysis = async (
    campaignId: string, 
    instanceId: string, 
    analysisContent: string, 
    teamSize: number, 
    responseRate: number
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('ai_feedback_analysis')
        .upsert({
          campaign_id: campaignId,
          instance_id: instanceId,
          supervisor_id: user.id,
          analysis_content: analysisContent,
          team_size: teamSize,
          response_rate: responseRate
        });

      if (error) {
        console.error('Error saving analysis:', error);
        toast({
          title: "Save failed",
          description: "Failed to save AI analysis. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const loadOrGenerateAnalysis = async (campaignId?: string, instanceId?: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to view AI analysis",
        variant: "destructive",
      });
      return;
    }

    if (!campaignId || !instanceId) {
      toast({
        title: "Missing information",
        description: "Please select a campaign and instance to view analysis",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setMetadata(null);

    try {
      // First, try to fetch existing analysis
      const existingAnalysis = await fetchExistingAnalysis(campaignId, instanceId);
      
      if (existingAnalysis) {
        // Use existing analysis
        setAnalysis(existingAnalysis.analysis_content);
        setMetadata({
          team_size: existingAnalysis.team_size,
          response_rate: existingAnalysis.response_rate,
          generated_at: existingAnalysis.generated_at
        });
        return;
      }

      // If no existing analysis, generate new one
      const { data, error } = await supabase.functions.invoke(
        'analyze-reportee-feedback',
        {
          body: {
            campaignId,
            instanceId,
            supervisorId: user.id
          }
        }
      );

      if (error) {
        console.error('Error generating AI analysis:', error);
        toast({
          title: "Analysis failed",
          description: "Failed to generate AI feedback analysis. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Save the new analysis to database
      await saveAnalysis(
        campaignId, 
        instanceId, 
        data.analysis, 
        data.metadata.team_size, 
        data.metadata.response_rate
      );

      setAnalysis(data.analysis);
      setMetadata(data.metadata);

    } catch (error) {
      console.error('Error with AI analysis:', error);
      toast({
        title: "Analysis failed",
        description: "An unexpected error occurred while processing analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setMetadata(null);
  };

  return {
    loadOrGenerateAnalysis,
    clearAnalysis,
    isLoading,
    analysis,
    metadata
  };
};
