import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponseTrendsTab } from "./CampaignPerformance/ResponseTrendsTab";
import { DemographicsTab } from "./CampaignPerformance/DemographicsTab";
import { ComparisonTab } from "./CampaignPerformance/ComparisonTab";
import { InstanceSelector } from "./CampaignPerformance/components/InstanceSelector";
import { useState, useEffect } from "react";
import { PerformanceDashboard } from "./CampaignPerformance/components/PerformanceDashboard";
import { ManagerialInsightsTab } from "./CampaignPerformance/ManagerialInsightsTab";

export default function CampaignPerformance() {
  const { id } = useParams();
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name),
          instances:campaign_instances(
            id,
            period_number,
            starts_at,
            ends_at,
            status,
            completion_rate
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (campaign?.instances) {
      const completedInstances = campaign.instances
        .filter(instance => instance.status === 'completed')
        .map(instance => instance.id);
      setSelectedInstanceIds(completedInstances);
    }
  }, [campaign]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">Loading...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
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
              <Link to={`/admin/surveys/campaigns/${id}`}>
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
        <>
          <PerformanceDashboard 
            campaignId={campaign.id}
            instances={selectedInstances}
          />
          
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">Response Trends</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="managerial">Managerial Insights</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <ResponseTrendsTab campaignId={campaign.id} instances={selectedInstances} />
            </TabsContent>

            <TabsContent value="demographics">
              <DemographicsTab campaignId={campaign.id} instances={selectedInstances} />
            </TabsContent>
            
            <TabsContent value="managerial">
              <ManagerialInsightsTab campaignId={campaign.id} instances={selectedInstances} />
            </TabsContent>

            <TabsContent value="comparison">
              <ComparisonTab campaignId={campaign.id} instances={selectedInstances} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Select instances above to view performance analysis</p>
        </div>
      )}
    </div>
  );
}
