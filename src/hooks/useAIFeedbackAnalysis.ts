
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './use-toast';

interface AIAnalysisMetadata {
  team_size: number;
  response_rate: number;
  generated_at: string;
}

interface AIAnalysisResponse {
  analysis: string;
  metadata: AIAnalysisMetadata;
}

export const useAIFeedbackAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AIAnalysisMetadata | null>(null);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const generateAnalysis = async (campaignId?: string, instanceId?: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate AI analysis",
        variant: "destructive",
      });
      return;
    }

    if (!campaignId) {
      toast({
        title: "Campaign required",
        description: "Please select a campaign to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setMetadata(null);

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
        return;
      }

      const result = data as AIAnalysisResponse;
      setAnalysis(result.analysis);
      setMetadata(result.metadata);

      toast({
        title: "Analysis generated",
        description: "AI feedback analysis has been successfully generated",
      });

    } catch (error) {
      console.error('Error calling AI analysis function:', error);
      toast({
        title: "Analysis failed",
        description: "An unexpected error occurred while generating analysis",
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
    generateAnalysis,
    clearAnalysis,
    isLoading,
    analysis,
    metadata
  };
};
