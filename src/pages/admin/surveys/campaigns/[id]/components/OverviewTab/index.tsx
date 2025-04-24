
import React from "react";

export interface OverviewTabProps {
  campaignId: string;
}

export function OverviewTab({ campaignId }: OverviewTabProps) {
  return (
    <div className="grid gap-6">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Campaign Overview</h3>
        <p className="text-muted-foreground">Campaign ID: {campaignId}</p>
        <p className="text-muted-foreground">Detailed statistics and overview will appear here.</p>
      </div>
    </div>
  );
}
