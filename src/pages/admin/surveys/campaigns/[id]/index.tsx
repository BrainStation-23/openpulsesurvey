import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCampaign } from "./hooks/useCampaign";
import { CampaignForm } from "./components/CampaignForm";
import { CampaignAssignments } from "./components/AssignmentsTab/CampaignAssignments";
import { CampaignResponses } from "./components/ResponsesTab/CampaignResponses";
import { CampaignReports } from "./components/ReportsTab/CampaignReports";
import { CampaignComparison } from "./components/ComparisonTab/CampaignComparison";
import { CampaignPerformance } from "./components/CampaignPerformance/CampaignPerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIQueueMonitor } from "./components/AIQueueMonitor";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = id as string;

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    campaign,
    isLoading,
    isError,
    error,
    updateCampaign,
    deleteCampaign,
  } = useCampaign(campaignId);

  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load campaign: ${
          error?.message || "Something went wrong"
        }`,
      });
    }
  }, [isError, error, toast]);

  const handleSave = async (data: any) => {
    try {
      await updateCampaign(data);
      toast({
        title: "Success",
        description: "Campaign updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!campaignId) {
        throw new Error("Campaign ID is missing.");
      }
      await deleteCampaign(campaignId);
      toast({
        title: "Success",
        description: "Campaign deleted successfully.",
      });
      navigate("/admin/surveys/campaigns");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <div>Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/surveys/campaigns")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
      </div>

      <p className="text-muted-foreground">
        Here you can manage the campaign, configure assignments, and analyze
        results.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai-analyze">AI Analyze</TabsTrigger>
          <TabsTrigger value="ai-queue">AI Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CampaignForm
            campaign={campaign}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="assignments">
          <CampaignAssignments campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="responses">
          <CampaignResponses campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="reports">
          <CampaignReports campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="compare">
          <CampaignComparison campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="performance">
          <CampaignPerformance campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="ai-analyze">
          <div>AI Analyze</div>
        </TabsContent>

        <TabsContent value="ai-queue">
          <AIQueueMonitor campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
