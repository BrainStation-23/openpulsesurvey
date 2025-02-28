
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useToast } from "@/hooks/use-toast";
import { AnalysisData, DemographicStats } from "./types";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

type DemographicKey = keyof AnalysisData['demographics'];

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{ content: string } | null>(null);

  const { data: analysisData, isLoading: isLoadingData } = useQuery<AnalysisData>({
    queryKey: ['instance-analysis-data', campaignId, instanceId],
    queryFn: async () => {
      console.log('Fetching analysis data for:', { campaignId, instanceId });
      
      // Get campaign and survey info
      const { data: campaignData, error: campaignError } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(
            id,
            name,
            description,
            json_data
          )
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get instance info with aggregated stats
      const { data: instanceData, error: instanceError } = await supabase
        .from('campaign_instances')
        .select('*')
        .eq('id', instanceId)
        .single();

      if (instanceError) throw instanceError;

      // Get responses with demographic data
      const { data: responseData, error: responseError } = await supabase
        .from('survey_responses')
        .select(`
          id,
          response_data,
          campaign_instance_id,
          submitted_at,
          user:profiles(
            id,
            gender,
            location:locations(id, name),
            employment_type:employment_types(id, name),
            sbus:user_sbus(
              is_primary,
              sbu:sbus(id, name)
            )
          )
        `)
        .eq('campaign_instance_id', instanceId);

      if (responseError) throw responseError;

      // Process demographic data
      const demographicStats: AnalysisData['demographics'] = {
        by_department: {},
        by_gender: {},
        by_location: {},
        by_employment_type: {},
      };

      // Process question data based on type
      const questionStats: AnalysisData['questions'] = {};

      // Process each response
      responseData?.forEach(response => {
        // Process demographic data
        const user = response.user;
        const primarySbu = user?.sbus?.find((s: any) => s.is_primary)?.sbu?.name || 'Unknown';
        const location = user?.location?.name || 'Unknown';
        const gender = user?.gender || 'Unknown';
        const employmentType = user?.employment_type?.name || 'Unknown';

        // Define the demographic mappings
        const demographicMappings: [DemographicKey, string][] = [
          ['by_department', primarySbu],
          ['by_gender', gender],
          ['by_location', location],
          ['by_employment_type', employmentType]
        ];

        // Process each demographic category
        demographicMappings.forEach(([key, value]) => {
          if (!demographicStats[key][value]) {
            demographicStats[key][value] = { total: 0, completed: 0 };
          }
          demographicStats[key][value].total++;
          if (response.response_data) {
            demographicStats[key][value].completed++;
          }
        });

        // Process questions
        if (response.response_data) {
          Object.entries(response.response_data).forEach(([key, value]: [string, any]) => {
            if (!questionStats[key]) {
              questionStats[key] = {
                type: value.type,
                question: value.question,
                ...(value.type === 'rating' ? { average: 0 } : {}),
                ...(value.type === 'boolean' ? { true_count: 0, false_count: 0 } : {}),
                ...(value.type === 'text' ? { responses: [] } : {})
              };
            }

            // Update stats based on question type
            if (value.type === 'rating' && typeof value.answer === 'number') {
              questionStats[key].average = ((questionStats[key].average || 0) + value.answer) / 2;
            } else if (value.type === 'boolean') {
              if (value.answer === true) questionStats[key].true_count = (questionStats[key].true_count || 0) + 1;
              if (value.answer === false) questionStats[key].false_count = (questionStats[key].false_count || 0) + 1;
            } else if (value.type === 'text' && value.answer) {
              questionStats[key].responses = [...(questionStats[key].responses || []), value.answer];
            }
          });
        }
      });

      // Calculate response trends
      const responseTrends = responseData
        ?.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
        ?.reduce((acc: Array<{date: string; count: number}>, response) => {
          const date = new Date(response.submitted_at).toISOString().split('T')[0];
          const existing = acc.find(d => d.date === date);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        }, []);

      return {
        campaign: campaignData,
        instance: instanceData,
        overview: {
          completion_rate: instanceData.completion_rate,
          total_responses: responseData?.length || 0,
          response_trends: responseTrends || []
        },
        demographics: demographicStats,
        questions: questionStats
      };
    },
    enabled: !!instanceId && !!campaignId
  });
  
  const handleAnalyze = async (promptData: { id: string, text: string }) => {
    if (!analysisData) return;
    
    try {
      setIsAnalyzing(true);
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-campaign', {
        body: {
          promptId: promptData.id,
          promptText: promptData.text,
          analysisData 
        },
      });

      if (error) throw error;
      setAnalysis(analysisResult);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate analysis",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!instanceId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a period to analyze responses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PromptSelector
        onAnalyze={handleAnalyze}
        analysisData={analysisData}
        isAnalyzing={isAnalyzing}
      />

      <AnalysisViewer
        content={analysis?.content || "Select a prompt and click Analyze to generate insights."}
        isLoading={isAnalyzing}
      />
    </div>
  );
}
