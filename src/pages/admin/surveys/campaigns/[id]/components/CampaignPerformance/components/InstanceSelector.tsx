
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CampaignInstance } from "../types";
import { CheckCircle } from "lucide-react";

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

      <Select 
        value={selectedInstanceIds.join(',')} 
        onValueChange={(value) => onInstanceSelect(value.split(',').filter(Boolean))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select instances to analyze" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Completed Instances</SelectLabel>
            {completedInstances.map((instance) => (
              <SelectItem key={instance.id} value={instance.id}>
                <div className="flex items-center gap-2">
                  <span>
                    Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
                  </span>
                  {selectedInstanceIds.includes(instance.id) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedInstanceIds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select instances to view performance analysis. Only completed instances can be analyzed.
        </p>
      )}
    </div>
  );
}
