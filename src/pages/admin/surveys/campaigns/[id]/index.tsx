
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Calendar, Presentation, Settings } from "lucide-react";
import { OverviewTab } from "./components/OverviewTab";
import { ReportsTab } from "./components/ReportsTab";
import { useCampaignData } from "@/hooks/useCampaignData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Temporary component placeholders until they're implemented
const ParticipantsTab = ({ campaignId }: { campaignId: string }) => (
  <div className="p-4 border rounded-lg">
    <h3 className="text-lg font-medium mb-2">Participants Tab</h3>
    <p className="text-muted-foreground">This feature is coming soon.</p>
  </div>
);

const SettingsTab = ({ campaignId }: { campaignId: string }) => (
  <div className="p-4 border rounded-lg">
    <h3 className="text-lg font-medium mb-2">Settings Tab</h3>
    <p className="text-muted-foreground">Campaign settings will be available soon.</p>
  </div>
);

export default function CampaignDetailsPage() {
  const navigate = useNavigate();
  const { data: campaign, isLoading, error } = useCampaignData();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/surveys/campaigns")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Campaign not found</h2>
          <p className="text-muted-foreground">The campaign you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/admin/surveys/campaigns")}
          >
            Return to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  // Handle nested route
  if (location.pathname.includes('/performance') || location.pathname.includes('/instances') || location.pathname.includes('/present')) {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/surveys/campaigns")}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.survey.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/surveys/campaigns/${campaign.id}/instances`)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Manage Instances
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/surveys/campaigns/${campaign.id}/performance`)}
            className="gap-2"
          >
            <Presentation className="h-4 w-4" />
            View Performance
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/surveys/campaigns/${campaign.id}/present`)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Presentation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="participants">
          <ParticipantsTab campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab campaignId={campaign.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
