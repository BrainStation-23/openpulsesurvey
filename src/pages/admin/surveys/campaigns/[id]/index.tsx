
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
import { ResponseStatus, SurveyAssignment } from "@/pages/admin/surveys/types/assignments";

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
          instances:campaign_instances(
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

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["campaign-assignments", id, selectedInstanceId],
    queryFn: async () => {
      // Start with the base query using LEFT JOIN
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
          responses:survey_responses (
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
        query.or(`responses.campaign_instance_id.eq.${selectedInstanceId},and(responses.is.null)`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as unknown as Array<any>)?.map(assignment => {
        // Find the relevant response for the selected instance
        const instanceResponse = assignment.responses?.find(
          (response: any) => !selectedInstanceId || response.campaign_instance_id === selectedInstanceId
        );

        // Determine the status based on instance and response
        let status: ResponseStatus = 'assigned';
        if (instanceResponse) {
          status = instanceResponse.status as ResponseStatus;
        } else if (selectedInstanceId) {
          // Check if instance has expired
          const instance = campaign?.instances?.find((i: any) => i.id === selectedInstanceId);
          if (instance && new Date(instance.ends_at) < new Date()) {
            status = 'expired';
          }
        }

        return {
          id: assignment.id,
          survey_id: assignment.survey_id,
          campaign_id: assignment.campaign_id,
          user_id: assignment.user_id,
          created_by: assignment.created_by,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          public_access_token: assignment.public_access_token,
          last_reminder_sent: assignment.last_reminder_sent,
          status,
          user: {
            id: assignment.user.id,
            email: assignment.user.email,
            first_name: assignment.user.first_name,
            last_name: assignment.user.last_name,
            user_sbus: assignment.user.user_sbus.map((userSbu: any) => ({
              is_primary: userSbu.is_primary,
              sbu: userSbu.sbus
            }))
          },
          response: instanceResponse ? {
            status: instanceResponse.status,
            campaign_instance_id: instanceResponse.campaign_instance_id
          } : undefined
        } as SurveyAssignment;
      }) || [];
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
        <InstanceSelector
          campaignId={campaign.id}
          selectedInstanceId={selectedInstanceId}
          onInstanceSelect={setSelectedInstanceId}
        />
      </div>

      <CampaignTabs isAnonymous={campaign.anonymous} status={campaign.status}>
        <TabPanel value="overview">
          <OverviewTab 
            campaignId={campaign.id} 
            selectedInstanceId={selectedInstanceId}
          />
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
