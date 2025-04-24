
import React from 'react';

export function NoDataView() {
  return (
    <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
      <p className="text-muted-foreground">No demographic data available for this campaign</p>
    </div>
  );
}
