
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignTabs, TabPanel } from "./components/CampaignTabs";
import { CampaignHeader } from "./components/CampaignHeader";
import { AssignmentInstanceList } from "./components/AssignmentInstanceList";
import { ResponsesTab } from "./components/ResponsesTab";
import { OverviewTab } from "./components/OverviewTab";
import { ReportsTab } from "./components/ReportsTab";
import { InstanceSelector } from "./components/InstanceSelector";
import { AIAnalyzeTab } from "./components/AIAnalyzeTab";
import { useState } from "react";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { Assignment } from "@/pages/admin/surveys/types/assignments";

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
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["campaign-assignments", id, selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          survey_id,
          campaign_id,
          user_id,
          created_by,
          created_at,
          updated_at,
          public_access_token,
          last_reminder_sent,
          responses:survey_responses!inner (
            status,
            campaign_instance_id
          ),
          user:profiles!survey_assignments_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            user_sbus (
              id,
              is_primary,
              sbus:sbus (
                id,
                name
              )
            )
          )
        `)
        .eq("campaign_id", id);

      // If an instance is selected, filter responses by instance
      if (selectedInstanceId) {
        query.eq('responses.campaign_instance_id', selectedInstanceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data?.map(assignment => ({
        ...assignment,
        status: (assignment.responses?.[0]?.status || 'assigned') as ResponseStatus,
        user: {
          ...assignment.user,
          user_sbus: assignment.user.user_sbus.map(userSbu => ({
            is_primary: userSbu.is_primary,
            sbu: userSbu.sbus
          }))
        }
      })) || []) as Assignment[];
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
      <CampaignHeader campaign={campaign} isLoading={isLoadingCampaign} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Campaign Details</h2>
        <InstanceSelector
          campaignId={campaign.id}
          selectedInstanceId={selectedInstanceId}
          onInstanceSelect={setSelectedInstanceId}
        />
      </div>

      <CampaignTabs isAnonymous={campaign.anonymous} status={campaign.status}>
        <TabPanel value="overview">
          <OverviewTab campaignId={campaign.id} />
        </TabPanel>

        <TabPanel value="assignments">
          <AssignmentInstanceList
            assignments={assignments || []}
            isLoading={isLoadingAssignments}
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
