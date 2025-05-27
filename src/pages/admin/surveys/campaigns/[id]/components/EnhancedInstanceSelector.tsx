
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore, parseISO } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignInstance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface EnhancedInstanceSelectorProps {
  campaignId: string;
  selectedInstanceId?: string;
  onInstanceSelect: (instanceId: string) => void;
  disabledInstanceId?: string;
  allowedStatuses?: ('active' | 'completed' | 'upcoming')[];
}

export function EnhancedInstanceSelector({
  campaignId,
  selectedInstanceId,
  onInstanceSelect,
  disabledInstanceId,
  allowedStatuses = ['active', 'completed', 'upcoming'], // Default to all statuses
}: EnhancedInstanceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: instances, isLoading } = useQuery({
    queryKey: ["campaign-instances", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) {
        console.error("Error fetching instances:", error);
        throw error;
      }
      return data as CampaignInstance[];
    },
    enabled: !!campaignId,
  });

  // Filter instances based on allowed statuses
  const filteredByStatus = instances?.filter(instance => 
    allowedStatuses.includes(instance.status)
  );

  // Default instance selection logic (active, else most recent completed, else first)
  useEffect(() => {
    if (filteredByStatus?.length && !selectedInstanceId) {
      let defaultInstance = undefined;
      // Find active instance within allowed statuses
      if (allowedStatuses.includes('active')) {
        const active = filteredByStatus.find(instance => instance.status === "active");
        if (active) {
          defaultInstance = active;
        }
      }
      
      if (!defaultInstance && allowedStatuses.includes('completed')) {
        // Most recent completed (period_number descending order)
        const completed = filteredByStatus.find(instance => instance.status === "completed");
        if (completed) {
          defaultInstance = completed;
        }
      }
      
      if (!defaultInstance) {
        // Fallback: first instance in the list
        defaultInstance = filteredByStatus[0];
      }
      
      if (defaultInstance) {
        onInstanceSelect(defaultInstance.id);
      }
    }
  }, [filteredByStatus, selectedInstanceId, onInstanceSelect, allowedStatuses]);

  const currentInstance = filteredByStatus?.find(
    (instance) => instance.id === selectedInstanceId
  );

  const filteredInstances = filteredByStatus?.filter((instance) => {
    const periodMatch = instance.period_number.toString().includes(searchTerm);
    const dateMatch = 
      format(new Date(instance.starts_at), "MMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(instance.ends_at), "MMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = !statusFilter || instance.status === statusFilter;
    
    return (periodMatch || dateMatch) && statusMatch;
  });

  const selectLatestActive = () => {
    if (!allowedStatuses.includes('active')) return;
    const activeInstance = filteredByStatus?.find(instance => instance.status === 'active');
    if (activeInstance) {
      onInstanceSelect(activeInstance.id);
      setOpen(false);
    }
  };

  const selectMostRecentCompleted = () => {
    if (!allowedStatuses.includes('completed')) return;
    const completedInstances = filteredByStatus?.filter(instance => instance.status === 'completed') || [];
    if (completedInstances.length > 0) {
      completedInstances.sort((a, b) => 
        isAfter(new Date(a.ends_at), new Date(b.ends_at)) ? -1 : 1
      );
      onInstanceSelect(completedInstances[0].id);
      setOpen(false);
    }
  };

  const selectPrevious = () => {
    if (!currentInstance || !filteredByStatus?.length) return;
    
    const currentIndex = filteredByStatus.findIndex(i => i.id === currentInstance.id);
    if (currentIndex < filteredByStatus.length - 1) {
      onInstanceSelect(filteredByStatus[currentIndex + 1].id);
    }
  };

  const selectNext = () => {
    if (!currentInstance || !filteredByStatus?.length) return;
    
    const currentIndex = filteredByStatus.findIndex(i => i.id === currentInstance.id);
    if (currentIndex > 0) {
      onInstanceSelect(filteredByStatus[currentIndex - 1].id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-amber-500">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const isInstanceDisabled = (instanceId: string) => {
    return disabledInstanceId === instanceId;
  };

  if (isLoading) return <div>Loading instances...</div>;

  if (!filteredByStatus?.length) {
    return <div className="text-sm text-muted-foreground">No instances available</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={open} 
              className="w-[280px] justify-between"
            >
              {currentInstance ? (
                <div className="flex flex-col items-start">
                  <span>Period {currentInstance.period_number}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(currentInstance.starts_at), "MMM d")} - {format(new Date(currentInstance.ends_at), "MMM d")}
                  </span>
                </div>
              ) : (
                "Select instance"
              )}
              <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input 
                  placeholder="Search instance..." 
                  className="flex w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <X 
                    className="h-4 w-4 opacity-50 cursor-pointer" 
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
              <div className="border-b px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant={statusFilter === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setStatusFilter(null)}
                  >
                    All
                  </Badge>
                  {allowedStatuses.includes('active') && (
                    <Badge 
                      variant={statusFilter === "active" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("active")}
                    >
                      Active
                    </Badge>
                  )}
                  {allowedStatuses.includes('completed') && (
                    <Badge 
                      variant={statusFilter === "completed" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("completed")}
                    >
                      Completed
                    </Badge>
                  )}
                  {allowedStatuses.includes('upcoming') && (
                    <Badge 
                      variant={statusFilter === "upcoming" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("upcoming")}
                    >
                      Upcoming
                    </Badge>
                  )}
                </div>
              </div>
              <div className="border-b px-3 py-2">
                <div className="grid grid-cols-2 gap-1">
                  {allowedStatuses.includes('active') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectLatestActive}
                      className="text-xs"
                    >
                      Latest Active
                    </Button>
                  )}
                  {allowedStatuses.includes('completed') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectMostRecentCompleted}
                      className="text-xs"
                    >
                      Recent Completed
                    </Button>
                  )}
                </div>
              </div>
              <CommandList>
                <CommandEmpty>No instances found.</CommandEmpty>
                <CommandGroup>
                  {filteredInstances?.map((instance) => (
                    <CommandItem
                      key={instance.id}
                      value={instance.id}
                      onSelect={() => {
                        onInstanceSelect(instance.id);
                        setOpen(false);
                      }}
                      disabled={isInstanceDisabled(instance.id)}
                      className={`flex justify-between items-center ${isInstanceDisabled(instance.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span>Period {instance.period_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")}
                        </span>
                      </div>
                      <div>
                        {getStatusBadge(instance.status)}
                        {isInstanceDisabled(instance.id) && (
                          <Badge variant="outline" className="ml-1">Selected in other field</Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={selectPrevious}
            disabled={!currentInstance || filteredByStatus.findIndex(i => i.id === currentInstance.id) === filteredByStatus.length - 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={selectNext}
            disabled={!currentInstance || filteredByStatus.findIndex(i => i.id === currentInstance.id) === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
