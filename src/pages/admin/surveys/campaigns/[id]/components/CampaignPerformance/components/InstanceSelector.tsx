
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { CampaignInstance } from "../types";

interface InstanceSelectorProps {
  instances: CampaignInstance[];
  selectedInstanceIds: string[];
  onInstanceSelect: (instanceIds: string[]) => void;
}

export function InstanceSelector({ 
  instances, 
  selectedInstanceIds, 
  onInstanceSelect 
}: InstanceSelectorProps) {
  // Filter only completed instances
  const completedInstances = instances.filter(instance => instance.status === 'completed');

  const handleSelectAll = () => {
    onInstanceSelect(completedInstances.map(instance => instance.id));
  };

  const handleClearAll = () => {
    onInstanceSelect([]);
  };

  const toggleInstance = (instanceId: string) => {
    if (selectedInstanceIds.includes(instanceId)) {
      onInstanceSelect(selectedInstanceIds.filter(id => id !== instanceId));
    } else {
      onInstanceSelect([...selectedInstanceIds, instanceId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Select Instances to Analyze</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All Completed
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear Selection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {completedInstances.map((instance) => (
          <button
            key={instance.id}
            onClick={() => toggleInstance(instance.id)}
            className={`
              relative p-4 rounded-lg border transition-all duration-200
              ${selectedInstanceIds.includes(instance.id) 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <div className="flex flex-col space-y-1">
              <span className="font-medium">
                Period {instance.period_number}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")}
              </span>
            </div>
            
            {selectedInstanceIds.includes(instance.id) && (
              <div className="absolute top-2 right-2">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedInstanceIds.length === 0 && (
        <p className="text-sm text-muted-foreground text-center bg-muted/50 p-4 rounded-lg">
          Select instances to view performance analysis. Only completed instances can be analyzed.
        </p>
      )}
      
      {selectedInstanceIds.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedInstanceIds.length} instance{selectedInstanceIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
