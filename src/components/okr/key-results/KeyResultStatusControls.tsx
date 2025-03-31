
import React from 'react';
import { Button } from '@/components/ui/button';
import { KeyResultStatus } from '@/types/okr';
import { AlertTriangle, Check, Clock } from 'lucide-react';

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
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Only show "Mark At Risk" button if not already completed */}
        {status !== 'at_risk' && status !== 'completed' && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onStatusUpdate('at_risk')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            At Risk
          </Button>
        )}
        
        {status !== 'on_track' && progress < 100 && status !== 'completed' && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => onStatusUpdate('on_track')}
          >
            <Clock className="h-4 w-4 mr-1" />
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
            Complete
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Current status: <span className="font-medium">{status.replace('_', ' ')}</span>
      </p>
    </div>
  );
};
