
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
      const { data: teamMembers } = await supabase
        .from('user_supervisors')
        .select('user_id')
        .eq('supervisor_id', user.id);

      if (!teamMembers?.length) return [];

      const userIds = teamMembers.map(tm => tm.user_id);

      // Get assignments for these team members
      const { data: assignments, error } = await supabase
        .from('survey_assignments')
        .select(`
          campaign_id
        `)
        .in('user_id', userIds);

      if (error) throw error;

      if (!assignments.length) return [];

      // Get unique campaign IDs
      const uniqueCampaignIds = [...new Set(assignments.map(a => a.campaign_id))];

      // Fetch campaign details
      const { data: campaigns, error: campaignsError } = await supabase
        .from('survey_campaigns')
        .select(`
          id,
          name,
          campaign_instances (
            id,
            period_number,
            status
          )
        `)
        .in('id', uniqueCampaignIds)
        .eq('status', 'active');

      if (campaignsError) throw campaignsError;

      // Extract and transform the data
      return campaigns?.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        hasInstances: campaign.campaign_instances.length > 0
      })) || [];
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
    return <div className="text-sm text-muted-foreground">No campaigns available</div>;
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
