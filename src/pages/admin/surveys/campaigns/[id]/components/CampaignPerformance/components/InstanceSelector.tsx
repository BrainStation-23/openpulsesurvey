
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, Search, X } from "lucide-react";
import { CampaignInstance } from "../types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [isOpen, setIsOpen] = useState(false);
  
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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Select Instances ({selectedInstanceIds.length} selected)
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Select Instances to Analyze</SheetTitle>
            <SheetDescription>
              Choose completed instances to include in your analysis
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear Selection
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search periods..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredInstances.length} instances available
              {selectedInstanceIds.length > 0 && ` • ${selectedInstanceIds.length} selected`}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {filteredInstances.map((instance) => (
                  <button
                    key={instance.id}
                    onClick={() => toggleInstance(instance.id)}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-all duration-200
                      ${selectedInstanceIds.includes(instance.id) 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">
                          Period {instance.period_number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")}
                        </span>
                      </div>
                      {selectedInstanceIds.includes(instance.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}

                {filteredInstances.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">
                    {searchQuery ? 'No instances match your search' : 'No completed instances available'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {selectedInstanceIds.length === 0 && (
        <p className="text-sm text-muted-foreground text-center bg-muted/50 p-4 rounded-lg">
          Select instances to view performance analysis. Only completed instances can be analyzed.
        </p>
      )}
    </div>
  );
}
