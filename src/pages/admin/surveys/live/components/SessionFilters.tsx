
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SessionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: string[];
  onStatusChange: (status: string) => void;
  showMineOnly: boolean;
  onShowMineChange: (value: boolean) => void;
}

export function SessionFilters({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  showMineOnly,
  onShowMineChange,
}: SessionFiltersProps) {
  const statuses = ["initial", "active", "paused", "ended"];

  const getStatusVariant = (status: string) => {
    return selectedStatuses.includes(status) ? "default" : "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="mine-only"
            checked={showMineOnly}
            onCheckedChange={onShowMineChange}
          />
          <Label htmlFor="mine-only">Created by me</Label>
        </div>
      </div>
      <div className="flex gap-2">
        {statuses.map((status) => (
          <Badge
            key={status}
            variant={getStatusVariant(status)}
            className="cursor-pointer capitalize"
            onClick={() => onStatusChange(status)}
          >
            {status}
          </Badge>
        ))}
      </div>
    </div>
  );
}
