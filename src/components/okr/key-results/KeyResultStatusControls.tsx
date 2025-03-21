
import React from 'react';
import { Button } from '@/components/ui/button';
import { KeyResultStatus } from '@/types/okr';
import { AlertTriangle, Check } from 'lucide-react';

interface KeyResultStatusControlsProps {
  status: KeyResultStatus;
  progress: number;
  onStatusUpdate: (status: KeyResultStatus) => void;
}

export const KeyResultStatusControls: React.FC<KeyResultStatusControlsProps> = ({
  status,
  progress,
  onStatusUpdate
}) => {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Status: <span className="font-normal">{status.replace('_', ' ')}</span></h4>
      <div className="grid grid-cols-2 gap-2">
        {status !== 'at_risk' && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onStatusUpdate('at_risk')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Mark At Risk
          </Button>
        )}
        
        {status !== 'on_track' && progress < 100 && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => onStatusUpdate('on_track')}
          >
            On Track
          </Button>
        )}
        
        {status !== 'completed' && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => onStatusUpdate('completed')}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
};
