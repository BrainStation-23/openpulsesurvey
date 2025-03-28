
import React from "react";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { type ProcessingProgressEvent } from "../../utils/csvProcessor";

interface ProcessingProgressProps {
  progress: ProcessingProgressEvent | null;
}

export function ProcessingProgress({ progress }: ProcessingProgressProps) {
  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <LoadingSpinner />
        <p className="text-sm text-gray-500 mt-2">Preparing to process file...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Progress value={progress.percentage} className="h-2" />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>{getStageLabel(progress.stage)}</div>
        <div>{progress.percentage}%</div>
      </div>
      
      <p className="text-sm text-center text-gray-600">
        {progress.message}
      </p>
      
      {progress.stage !== 'init' && progress.stage !== 'complete' && (
        <p className="text-xs text-center text-muted-foreground">
          Processing row {progress.currentRow} of {progress.totalRows > 0 ? progress.totalRows : '?'}
        </p>
      )}
      
      {progress.stage === 'complete' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
          <p className="text-sm text-green-700 text-center">
            File processed successfully!
          </p>
        </div>
      )}
    </div>
  );
}

function getStageLabel(stage: ProcessingProgressEvent['stage']): string {
  switch (stage) {
    case 'init':
      return 'Initializing';
    case 'parsing':
      return 'Parsing CSV';
    case 'validating':
      return 'Validating Data';
    case 'verifying':
      return 'Verifying Users';
    case 'checking_entities':
      return 'Checking References';
    case 'complete':
      return 'Complete';
    default:
      return 'Processing';
  }
}
