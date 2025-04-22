
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

interface ManagerTableHeaderProps {
  onSort: (key: string) => void;
  sortConfig: SortConfig[];
}

export function ManagerTableHeader({ onSort, sortConfig }: ManagerTableHeaderProps) {
  const getSortIcon = (key: string) => {
    const sort = sortConfig.find(s => s.key === key);
    if (!sort) return null;
    return sort.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead>Rank</TableHead>
        <TableHead>Manager</TableHead>
        <TableHead>Department</TableHead>
        <TableHead className="text-right">Assigned</TableHead>
        <TableHead className="text-right">Completed</TableHead>
        <TableHead 
          className="text-right cursor-pointer"
          onClick={() => onSort('avg_score')}
        >
          <div className="flex items-center justify-end gap-1">
            Avg Score
            {getSortIcon('avg_score')}
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer"
          onClick={() => onSort('completion_rate')}
        >
          <div className="flex items-center justify-end gap-1">
            Completion Rate
            {getSortIcon('completion_rate')}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
