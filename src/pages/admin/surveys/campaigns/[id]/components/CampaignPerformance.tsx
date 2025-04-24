
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ResponseTrendsTab } from "./CampaignPerformance/ResponseTrendsTab";
import { DemographicsTab } from "./CampaignPerformance/DemographicsTab";
import { ComparisonTab } from "./CampaignPerformance/ComparisonTab";
import { InstanceSelector } from "./CampaignPerformance/components/InstanceSelector";
import { useState, useEffect } from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CampaignPerformance() {
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const { data: campaign, isLoading, error } = useCampaignData();

  // Set initially selected instances to all completed instances
  useEffect(() => {
    if (campaign?.instances) {
      const completedInstances = campaign.instances
        .filter(instance => instance.status === 'completed')
        .map(instance => instance.id);
      setSelectedInstanceIds(completedInstances);
    }
  }, [campaign]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>;
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link to="/admin/surveys/campaigns">
              <ChevronLeft className="h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Campaign not found</h2>
          <p className="text-muted-foreground">The campaign you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            asChild
          >
            <Link to="/admin/surveys/campaigns">Return to Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  const selectedInstances = campaign.instances.filter(
    instance => selectedInstanceIds.includes(instance.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2"
            >
              <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
                <ChevronLeft className="h-4 w-4" />
                Back to Campaign
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{campaign?.name} Performance</h1>
          <p className="text-muted-foreground">
            Analyze campaign performance across all instances
          </p>
        </div>
      </div>

      <InstanceSelector
        instances={campaign.instances}
        selectedInstanceIds={selectedInstanceIds}
        onInstanceSelect={setSelectedInstanceIds}
      />

      {selectedInstances.length > 0 ? (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Response Trends</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <ResponseTrendsTab campaignId={campaign.id} instances={selectedInstances} />
          </TabsContent>

          <TabsContent value="demographics">
            <DemographicsTab campaignId={campaign.id} instances={selectedInstances} />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonTab campaignId={campaign.id} instances={selectedInstances} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Select instances above to view performance analysis</p>
        </div>
      )}
    </div>
  );
}
