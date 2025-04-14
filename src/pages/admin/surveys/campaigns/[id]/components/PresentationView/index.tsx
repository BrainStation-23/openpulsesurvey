
import { useParams, useSearchParams } from "react-router-dom";
import { useCampaignData } from "./hooks/useCampaignData";
import { PresentationContent } from "@/components/shared/presentation/PresentationContent";

export default function PresentationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const { data: campaign } = useCampaignData(id, instanceId);

  if (!campaign) return null;

  return (
    <PresentationContent 
      campaign={campaign}
      onBack={() => window.history.back()}
    />
  );
}
