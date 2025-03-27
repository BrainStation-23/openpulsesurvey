
import React from 'react';
import { Panel } from '@xyflow/react';

export const TeamLegendPanel: React.FC = () => {
  return (
    <Panel position="top-left" className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 p-2 rounded text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
        <span>Supervisor</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span>You</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        <span>Team Member</span>
      </div>
    </Panel>
  );
};
