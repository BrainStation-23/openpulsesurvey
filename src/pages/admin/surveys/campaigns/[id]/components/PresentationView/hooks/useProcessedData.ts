
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCampaignData } from "./useCampaignData";
import { ProcessedData } from "../types/responses";

// Mock function to process survey data - in a real app, this would call your API
const processData = async (campaignId: string, instanceId?: string): Promise<ProcessedData> => {
  // This is a simplified mock of what would normally be an API call
  // In reality, you would fetch this from your backend
  
  // For now, return a basic structure
  return {
    summary: {
      totalResponses: 100,
      completionRate: 65.4,
      averageRating: 4.2,
    },
    questions: [
      {
        id: "q1",
        name: "satisfaction",
        type: "rating",
        title: "How satisfied are you?",
        rateCount: 5
      }
    ],
    questionData: {
      "q1": {
        ratings: { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 },
        avgRating: 3.9
      }
    },
    comparisons: {
      "q1": {
        "sbu": {
          "HR": { avgRating: 4.2, choices: {} },
          "IT": { avgRating: 3.8, choices: {} },
          "Finance": { avgRating: 4.0, choices: {} }
        }
      }
    },
    responses: []
  };
};

export function useProcessedData() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const { data: campaign } = useCampaignData(id, instanceId);
  
  const { data: processedData, isLoading, error } = useQuery({
    queryKey: ['processedData', id, instanceId],
    queryFn: () => processData(id!, instanceId || undefined),
    enabled: !!id && !!campaign,
  });
  
  return {
    processedData,
    isLoading,
    error
  };
}
