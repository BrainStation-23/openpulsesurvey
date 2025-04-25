
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export function HeatMapChart({ data }: { data: any[] }) {
  const [sortBy, setSortBy] = useState("dimension");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    if (sortOrder === "asc") {
      return String(aValue).localeCompare(String(bValue));
    } else {
      return String(bValue).localeCompare(String(aValue));
    }
  });
  
  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("dimension")}
            >
              Dimension
              {sortBy === "dimension" && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-100 text-center"
              onClick={() => handleSort("unsatisfied")}
            >
              Unsatisfied (1-2)
              {sortBy === "unsatisfied" && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-100 text-center"
              onClick={() => handleSort("neutral")}
            >
              Neutral (3)
              {sortBy === "neutral" && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-100 text-center"
              onClick={() => handleSort("satisfied")}
            >
              Satisfied (4-5)
              {sortBy === "satisfied" && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-100 text-center"
              onClick={() => handleSort("avg_score")}
            >
              Avg Score
              {sortBy === "avg_score" && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const total = row.total;
            
            // Calculate percentages
            const unsatisfiedPct = total > 0 ? (row.unsatisfied / total) * 100 : 0;
            const neutralPct = total > 0 ? (row.neutral / total) * 100 : 0;
            const satisfiedPct = total > 0 ? (row.satisfied / total) * 100 : 0;
            
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.dimension}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="bg-red-500 h-4 rounded-sm mr-2"
                      style={{ width: `${unsatisfiedPct}%` }}
                    ></div>
                    <span>{row.unsatisfied} ({Math.round(unsatisfiedPct)}%)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="bg-yellow-500 h-4 rounded-sm mr-2"
                      style={{ width: `${neutralPct}%` }}
                    ></div>
                    <span>{row.neutral} ({Math.round(neutralPct)}%)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="bg-green-500 h-4 rounded-sm mr-2"
                      style={{ width: `${satisfiedPct}%` }}
                    ></div>
                    <span>{row.satisfied} ({Math.round(satisfiedPct)}%)</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg font-medium">{row.avg_score?.toFixed(1)}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
