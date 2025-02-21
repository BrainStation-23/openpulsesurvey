import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponseStatus } from "@/pages/admin/surveys/types/user-surveys";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SurveyFiltersProps {
  searchQuery: string;
  statusFilter: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string[]) => void;
  isLoading?: boolean;
}

const statuses = [
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "expired", label: "Expired" }
];

export default function SurveyFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  isLoading = false,
}: SurveyFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search surveys by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchQuery && !isLoading && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-2 top-2.5">
            <LoadingSpinner size={16} />
          </div>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-start">
            <span>Status: {statusFilter.length} selected</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  onSelect={() => {
                    const newStatusFilter = statusFilter.includes(status.value)
                      ? statusFilter.filter((s) => s !== status.value)
                      : [...statusFilter, status.value];
                    onStatusChange(newStatusFilter);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      statusFilter.includes(status.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <span>{status.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
