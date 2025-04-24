import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignTabs, TabPanel } from "./components/CampaignTabs";
import { CampaignHeader } from "./components/CampaignHeader";
import { AssignmentsTab } from "./components/AssignmentsTab";
import { ResponsesTab } from "./components/ResponsesTab";
import { OverviewTab } from "./components/OverviewTab";
import { ReportsTab } from "./components/ReportsTab";
import { EnhancedInstanceSelector } from "./components/EnhancedInstanceSelector";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LineChart } from "lucide-react";

const AIAnalyzeTab = ({ campaignId, instanceId }: { campaignId: string; instanceId?: string }) => {
  return (
    <div className="p-4 text-muted-foreground">
      AI Analysis coming soon
    </div>
  );
};

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();

  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          *,
          survey:surveys(
            id,
            name,
            description,
            json_data
          ),
          instances:campaign_instances!campaign_instances_campaign_id_fkey(
            id,
            starts_at,
            ends_at,
            period_number,
            status
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingCampaign) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <CampaignHeader 
        campaign={campaign} 
        isLoading={isLoadingCampaign} 
        selectedInstanceId={selectedInstanceId}
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Campaign Details</h2>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link to={`/admin/surveys/campaigns/${campaign.id}/performance`} className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              See Campaign Performance
            </Link>
          </Button>
          <EnhancedInstanceSelector
            campaignId={campaign.id}
            selectedInstanceId={selectedInstanceId}
            onInstanceSelect={setSelectedInstanceId}
          />
        </div>
      </div>

      <CampaignTabs isAnonymous={campaign.anonymous} status={campaign.status}>
        <TabPanel value="overview">
          <OverviewTab 
            campaignId={campaign.id} 
            selectedInstanceId={selectedInstanceId}
          />
        </TabPanel>

        <TabPanel value="assignments">
          <AssignmentsTab
            campaignId={campaign.id}
            surveyId={campaign.survey_id}
            selectedInstanceId={selectedInstanceId}
          />
        </TabPanel>

        <TabPanel value="responses">
          <ResponsesTab
            campaignId={campaign.id}
            instanceId={selectedInstanceId}
          />
        </TabPanel>

        <TabPanel value="reports">
          <ReportsTab
            campaignId={campaign.id}
            instanceId={selectedInstanceId}
          />
        </TabPanel>

        <TabPanel value="compare">
          <InstanceCompareTab />
        </TabPanel>

        <TabPanel value="analyze">
          <AIAnalyzeTab
            campaignId={campaign.id}
            instanceId={selectedInstanceId}
          />
        </TabPanel>
      </CampaignTabs>
    </div>
  );
}
