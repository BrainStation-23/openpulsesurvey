
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the full implementation
    navigate(`/admin/surveys/campaigns/${id}/`, { replace: true });
  }, [id, navigate]);
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
