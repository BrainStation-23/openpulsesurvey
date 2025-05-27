
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Campaign {
  id: string;
  name: string;
}

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedCampaignId: string | undefined;
  onSelectCampaign: (campaignId: string) => void;
  isLoading: boolean;
}

export function CampaignSelector({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
  isLoading
}: CampaignSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-[280px]" />;
  }

  if (!campaigns.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No campaigns available for trend analysis
      </div>
    );
  }

  return (
    <Select value={selectedCampaignId} onValueChange={onSelectCampaign}>
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
