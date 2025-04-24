
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Search,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupervisorPerformer } from "../types/instance-comparison";

type SortField = "name" | "base_score" | "comparison_score" | "change" | "base_rank" | "comparison_rank" | "rank_change";
type SortOrder = "asc" | "desc";

interface SupervisorPerformanceTableProps {
  data: SupervisorPerformer[];
}

export function SupervisorPerformanceTable({ data }: SupervisorPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("comparison_score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedData = [...data]
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      const multiplier = sortOrder === "asc" ? 1 : -1;
      
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return multiplier * fieldA.localeCompare(fieldB);
      }
      
      // @ts-ignore - we know we're comparing numbers here
      return multiplier * (fieldA - fieldB);
    });

  const getChangeIndicator = (change: number) => {
    if (change > 0.2) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < -0.2) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getCategoryBadge = (item: SupervisorPerformer) => {
    if (!item.category) return null;
    
    const variants = {
      improved: "bg-green-100 text-green-800 border-green-300",
      declined: "bg-red-100 text-red-800 border-red-300",
      stable: "bg-blue-100 text-blue-800 border-blue-300",
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${variants[item.category]} ml-2`}
      >
        {item.category}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 flex">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search supervisors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 font-semibold p-0"
                >
                  Supervisor
                  {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("base_score")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Base Score
                  {getSortIcon("base_score")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("comparison_score")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Current Score
                  {getSortIcon("comparison_score")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("change")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Change
                  {getSortIcon("change")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("base_rank")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Base Rank
                  {getSortIcon("base_rank")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("comparison_rank")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Current Rank
                  {getSortIcon("comparison_rank")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("rank_change")}
                  className="flex items-center gap-1 font-semibold p-0 ml-auto"
                >
                  Rank Change
                  {getSortIcon("rank_change")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium flex items-center">
                  {item.name}
                  {getCategoryBadge(item)}
                </TableCell>
                <TableCell className="text-right">
                  {item.base_score.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {item.comparison_score.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`${
                        item.change > 0
                          ? "text-green-600"
                          : item.change < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change.toFixed(2)}
                    </span>
                    {getChangeIndicator(item.change)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {item.base_rank === 999 ? "-" : item.base_rank}
                </TableCell>
                <TableCell className="text-right">
                  {item.comparison_rank === 999 ? "-" : item.comparison_rank}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`${
                        item.rank_change > 0
                          ? "text-green-600"
                          : item.rank_change < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.rank_change > 0 ? "+" : ""}
                      {item.rank_change}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No supervisor data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
