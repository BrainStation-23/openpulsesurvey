
import { Input } from "@/components/ui/input";
import { FilterOptions } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResponsesFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function ResponsesFilters({ filters, onFiltersChange }: ResponsesFiltersProps) {
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search responses..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="w-[300px]"
      />
      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as "date" | "name" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.sortDirection}
        onValueChange={(value) => onFiltersChange({ ...filters, sortDirection: value as "asc" | "desc" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
