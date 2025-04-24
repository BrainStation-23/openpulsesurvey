
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, Search } from "lucide-react";
import { CampaignInstance } from "../types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  
  // Add search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter instances based on search query
  const filteredInstances = completedInstances.filter(instance => 
    `Period ${instance.period_number}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(instance.starts_at), "MMM d").toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(instance.ends_at), "MMM d").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search periods..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Instance count indicator */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {filteredInstances.length} {filteredInstances.length === 1 ? 'instance' : 'instances'} available
        </span>
        {selectedInstanceIds.length > 0 && (
          <span>{selectedInstanceIds.length} selected</span>
        )}
      </div>

      {/* Scrollable container for instances */}
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredInstances.map((instance) => (
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
          
          {filteredInstances.length === 0 && (
            <div className="col-span-2 p-4 text-center text-muted-foreground">
              {searchQuery ? 'No instances match your search' : 'No completed instances available'}
            </div>
          )}
        </div>
      </ScrollArea>

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
