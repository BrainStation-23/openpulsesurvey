
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleSelectAll = () => {
    if (statusFilter.length === STATUS_OPTIONS.length) {
      onStatusChange([]);
    } else {
      onStatusChange(STATUS_OPTIONS.map(option => option.value));
    }
  };

  const isAllSelected = statusFilter.length === STATUS_OPTIONS.length;

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
            <LoadingSpinner size={16} />
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all-statuses" 
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="all-statuses"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All Statuses
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {STATUS_OPTIONS.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={statusFilter.includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <label
                  htmlFor={status.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
