
import { Search, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

interface SurveyFiltersProps {
  searchQuery: string;
  statusFilter: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string[]) => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'expired', label: 'Expired' }
];

export default function SurveyFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  isLoading = false,
}: SurveyFiltersProps) {
  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusChange([...statusFilter, status]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or org ID..."
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
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Status</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status.value}
              variant={statusFilter.includes(status.value) ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle(status.value)}
              className="rounded-full"
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
