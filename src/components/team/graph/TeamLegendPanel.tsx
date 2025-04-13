
import React from 'react';
import { Panel } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export const TeamLegendPanel = () => {
  return (
    <Panel position="bottom-left" className="bg-white bg-opacity-90 p-3 rounded-md shadow-sm text-xs border">
      <div className="font-medium mb-2">Legend</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Supervisor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Team Members</span>
        </div>
        <div className="mt-2 pt-2 border-t">
          <div className="font-medium mb-1">Levels</div>
          <p className="text-muted-foreground">Team members are arranged by level rank from top to bottom</p>
        </div>
      </div>
    </Panel>
  );
};
