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
  const [isFetchingExisting, setIsFetchingExisting] = useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AIAnalysisMetadata | null>(null);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Computed loading state
  const isLoading = isFetchingExisting || isGeneratingNew;

  const fetchExistingAnalysis = async (campaignId?: string, instanceId?: string) => {
    if (!user?.id || !campaignId || !instanceId) return null;

    console.log('Fetching existing analysis for:', { campaignId, instanceId, supervisorId: user.id });

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
          // Not found - this is expected when no analysis exists yet
          console.log('No existing analysis found - will generate new one');
          return null;
        }
        // Other errors should be logged but not prevent generation
        console.error('Error fetching existing analysis:', error);
        return null;
      }

      console.log('Found existing analysis:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching existing analysis:', error);
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

    console.log('Saving analysis to database...');

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
      } else {
        console.log('Analysis saved successfully');
      }
    } catch (error) {
      console.error('Unexpected error saving analysis:', error);
    }
  };

  const generateNewAnalysis = async (campaignId: string, instanceId: string) => {
    console.log('Generating new analysis...');
    setIsGeneratingNew(true);

    try {
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
        return false;
      }

      console.log('AI analysis generation response:', data);

      if (!data.success) {
        console.error('AI analysis generation failed:', data.error);
        toast({
          title: "Analysis failed",
          description: data.error || "Failed to generate AI feedback analysis",
          variant: "destructive",
        });
        return false;
      }

      console.log('Analysis generated successfully, now fetching from database...');
      
      // Fetch the newly generated analysis from the database
      const freshAnalysis = await fetchExistingAnalysis(campaignId, instanceId);
      
      if (freshAnalysis) {
        setAnalysis(freshAnalysis.analysis_content);
        setMetadata({
          team_size: freshAnalysis.team_size,
          response_rate: freshAnalysis.response_rate,
          generated_at: freshAnalysis.generated_at
        });
        return true;
      } else {
        toast({
          title: "Analysis failed",
          description: "Analysis was generated but could not be retrieved",
          variant: "destructive",
        });
        return false;
      }

    } catch (error) {
      console.error('Unexpected error generating analysis:', error);
      toast({
        title: "Analysis failed",
        description: "An unexpected error occurred while processing analysis",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGeneratingNew(false);
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

    console.log('Starting loadOrGenerateAnalysis for:', { campaignId, instanceId });

    // First, try to fetch existing analysis
    setIsFetchingExisting(true);
    const existingAnalysis = await fetchExistingAnalysis(campaignId, instanceId);
    setIsFetchingExisting(false);
    
    if (existingAnalysis) {
      // Use existing analysis
      console.log('Using existing analysis');
      setAnalysis(existingAnalysis.analysis_content);
      setMetadata({
        team_size: existingAnalysis.team_size,
        response_rate: existingAnalysis.response_rate,
        generated_at: existingAnalysis.generated_at
      });
      return;
    }

    // If no existing analysis, generate new one
    console.log('No existing analysis found, generating new one...');
    await generateNewAnalysis(campaignId, instanceId);
  };

  const regenerateAnalysis = async (campaignId?: string, instanceId?: string) => {
    if (!campaignId || !instanceId) return;
    
    console.log('Regenerating analysis...');
    
    // Clear current analysis and generate new one
    setAnalysis(null);
    setMetadata(null);
    
    await generateNewAnalysis(campaignId, instanceId);
  };

  const clearAnalysis = () => {
    console.log('Clearing analysis state');
    setAnalysis(null);
    setMetadata(null);
  };

  return {
    loadOrGenerateAnalysis,
    regenerateAnalysis,
    clearAnalysis,
    isLoading,
    isFetchingExisting,
    isGeneratingNew,
    analysis,
    metadata
  };
};
