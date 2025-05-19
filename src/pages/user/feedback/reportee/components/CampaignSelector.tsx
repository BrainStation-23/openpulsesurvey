
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CampaignSelectorProps {
  selectedCampaignId: string | undefined;
  onCampaignSelect: (campaignId: string) => void;
}

export function CampaignSelector({
  selectedCampaignId,
  onCampaignSelect,
}: CampaignSelectorProps) {
  const { user } = useCurrentUser();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['supervisor-campaigns', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get the team members supervised by this user
      const { data: teamMembers, error: teamError } = await supabase
        .from('user_supervisors')
        .select('user_id')
        .eq('supervisor_id', user.id);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        return [];
      }

      // If no team members found, log it but continue with empty array
      if (!teamMembers?.length) {
        console.log('No team members found for supervisor:', user.id);
        return [];
      }

      const userIds = teamMembers.map(tm => tm.user_id);

      // Get unique campaign IDs from assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('campaign_id')
        .in('user_id', userIds);

      if (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
        return [];
      }

      if (!assignments.length) {
        console.log('No assignments found for team members');
        return [];
      }

      // Get unique campaign IDs
      const uniqueCampaignIds = [...new Set(assignments.map(a => a.campaign_id))];

      // Fetch campaign details - Fix the relationship issue by removing the nested selection
      const { data: campaigns, error: campaignsError } = await supabase
        .from('survey_campaigns')
        .select(`
          id,
          name
        `)
        .in('id', uniqueCampaignIds)
        .eq('status', 'active');

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }

      // Now fetch instances in a separate query to check which campaigns have instances
      if (campaigns && campaigns.length > 0) {
        const campaignIds = campaigns.map(c => c.id);
        const { data: instances } = await supabase
          .from('campaign_instances')
          .select('campaign_id, id')
          .in('campaign_id', campaignIds);
          
        // Add hasInstances flag to each campaign
        return campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          hasInstances: instances ? instances.some(i => i.campaign_id === campaign.id) : false
        }));
      }

      return [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Set default campaign if none selected
    if (!selectedCampaignId && campaigns?.length) {
      onCampaignSelect(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId, onCampaignSelect]);

  if (isLoading) return <div>Loading campaigns...</div>;

  if (!campaigns?.length) {
    return <div className="text-sm text-muted-foreground">No campaigns available for your team members. Please ensure you have team members assigned to you as a supervisor and they have active survey assignments.</div>;
  }

  return (
    <Select value={selectedCampaignId} onValueChange={onCampaignSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select campaign" />
      </SelectTrigger>
      <SelectContent>
        {campaigns.map((campaign) => (
          <SelectItem key={campaign.id} value={campaign.id}>
            {campaign.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
