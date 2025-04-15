
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCampaignData } from "./useCampaignData";
import { ProcessedData } from "../types/responses";
import { usePresentationResponses } from "./usePresentationResponses";

export function useProcessedData() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const { data: campaign } = useCampaignData(id, instanceId);
  
  // Use the comprehensive response processing hook
  const { data: processedData, isLoading, error } = usePresentationResponses(id!, instanceId);

  return {
    processedData,
    isLoading,
    error
  };
}
