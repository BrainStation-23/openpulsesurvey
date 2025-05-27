
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentFiltersProps {
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function AssignmentFilters({
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
}: AssignmentFiltersProps) {
  const handleStatusChange = (value: string) => {
    // Convert "all" to null for the backend
    setStatusFilter(value === "all" ? null : value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Select 
        value={statusFilter || "all"} 
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="assigned">Assigned</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full max-w-xs"
        />
      </div>
    </div>
  );
}
