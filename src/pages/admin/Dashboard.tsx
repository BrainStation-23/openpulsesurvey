
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MetricsOverview } from "@/components/admin/dashboard/MetricsOverview";
import { CampaignOverview } from "@/pages/admin/surveys/components/CampaignOverview";
import { TourButton } from "@/components/onboarding/TourButton";
import { Tour } from "@/components/onboarding/Tour";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <TourButton tourId="dashboard_overview" title="Dashboard Guide" />
      </div>
      
      <div className="space-y-6">
        <div className="metrics-overview">
          <MetricsOverview />
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <CampaignOverview />
        </div>
      </div>
      
      <Tour />
    </div>
  );
}
