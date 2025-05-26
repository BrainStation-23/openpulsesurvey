
import React from 'react';
import { EnhancedInstanceSelector } from '@/pages/admin/surveys/campaigns/[id]/components/EnhancedInstanceSelector';

interface InstanceSelectorProps {
  campaignId: string | undefined;
  selectedInstanceId: string | undefined;
  onInstanceSelect: (instanceId: string) => void;
}

export function InstanceSelector({
  campaignId,
  selectedInstanceId,
  onInstanceSelect,
}: InstanceSelectorProps) {
  if (!campaignId) {
    return <div className="text-sm text-muted-foreground">Select a campaign first to see available instances</div>;
  }

  return (
    <EnhancedInstanceSelector
      campaignId={campaignId}
      selectedInstanceId={selectedInstanceId}
      onInstanceSelect={onInstanceSelect}
    />
  );
}
