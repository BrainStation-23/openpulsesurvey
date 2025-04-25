
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NpsComparisonData } from "../../types/nps";
import { NpsComparisonTable } from "./NpsComparisonTable";
import { SurveyResponse } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types/responses";
import { ComparisonDimension } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types/comparison";

interface NpsComparisonProps {
  responses: SurveyResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  isNps: boolean;
  campaignId?: string;
  instanceId?: string;
}

export function NpsComparison({ 
  responses, 
  questionName, 
  dimension,
  isNps,
  campaignId,
  instanceId
}: NpsComparisonProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['nps-comparison', campaignId, instanceId, questionName, dimension],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_nps_by_dimension', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId || null,
        p_question_name: questionName,
        p_dimension: dimension
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId && !!questionName && dimension !== 'main' && dimension !== 'none',
    refetchOnWindowFocus: false
  });
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading comparison data...</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="p-4 text-center">No comparison data available</div>;
  }
  
  return (
    <div className="w-full">
      <NpsComparisonTable data={data as NpsComparisonData[]} />
    </div>
  );
}
