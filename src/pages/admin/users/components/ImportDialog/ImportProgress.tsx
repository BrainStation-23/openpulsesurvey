
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pause, Play, X, FileCheck, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { BatchProgress } from "../../utils/batchProcessor";
import { useState } from "react";

interface ImportProgressProps {
  progress: BatchProgress;
  paused: boolean;
  onPauseToggle: () => void;
  onCancel: () => void;
}

export function ImportProgress({ progress, paused, onPauseToggle, onCancel }: ImportProgressProps) {
  const [showErrors, setShowErrors] = useState(false);
  
  const formatEstimatedTime = (ms: number) => {
    return formatDistanceToNow(Date.now() + ms, { includeSeconds: true });
  };

  const progressValue = (progress.processed / progress.total) * 100;
  const hasErrors = progress.errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Processing users</span>
          <span>{progressValue.toFixed(1)}%</span>
        </div>
        <Progress 
          value={progressValue} 
          indicatorClassName={hasErrors ? "bg-amber-500" : undefined}
        />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Current batch</span>
            <span className="text-sm font-medium">
              {progress.currentBatch} of {progress.totalBatches}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Users processed</span>
            <span className="text-sm font-medium">
              {progress.processed} of {progress.total}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Remaining time</span>
            <span className="text-sm font-medium flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {formatEstimatedTime(progress.estimatedTimeRemaining)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Status</span>
            <span className="text-sm font-medium">
              {paused ? (
                <span className="text-amber-600">Paused</span>
              ) : (
                <span className="text-blue-600">Processing</span>
              )}
            </span>
          </div>
        </div>
        
        {hasErrors && (
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 p-0 h-auto text-xs flex items-center"
              onClick={() => setShowErrors(!showErrors)}
            >
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {progress.errors.length} errors encountered
              <span className="ml-1 text-xs">{showErrors ? '(hide)' : '(show)'}</span>
            </Button>
            
            {showErrors && progress.errors.length > 0 && (
              <div className="mt-2 max-h-24 overflow-y-auto text-xs bg-red-50 p-2 rounded border border-red-100">
                <ul className="space-y-1">
                  {progress.errors.slice(0, 5).map((error, i) => (
                    <li key={i} className="text-red-700">
                      Row {error.row}: {error.message}
                    </li>
                  ))}
                  {progress.errors.length > 5 && (
                    <li className="text-red-600 font-medium">
                      And {progress.errors.length - 5} more errors...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPauseToggle}
          className="flex items-center gap-2"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
