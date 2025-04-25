
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NpsComparisonData } from "../../types/nps";
import { useState } from "react";

interface NpsComparisonTableProps {
  data: NpsComparisonData[];
}

export function NpsComparisonTable({ data }: NpsComparisonTableProps) {
  const [sortBy, setSortBy] = useState<keyof NpsComparisonData>("nps_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const handleSort = (column: keyof NpsComparisonData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy] as number;
    const bValue = b[sortBy] as number;
    
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });
  
  return (
    <Table className="min-w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Dimension</TableHead>
          <TableHead 
            className="text-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleSort("nps_score")}
          >
            NPS Score
            {sortBy === "nps_score" && (
              <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
            )}
          </TableHead>
          <TableHead 
            className="text-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleSort("detractors")}
          >
            Detractors
            {sortBy === "detractors" && (
              <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
            )}
          </TableHead>
          <TableHead 
            className="text-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleSort("passives")}
          >
            Passives
            {sortBy === "passives" && (
              <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
            )}
          </TableHead>
          <TableHead 
            className="text-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleSort("promoters")}
          >
            Promoters
            {sortBy === "promoters" && (
              <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
            )}
          </TableHead>
          <TableHead 
            className="text-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleSort("total")}
          >
            Total
            {sortBy === "total" && (
              <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
            )}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, index) => {
          const npsScore = Math.round(row.nps_score);
          const detractorPct = Math.round((row.detractors / row.total) * 100);
          const passivePct = Math.round((row.passives / row.total) * 100);
          const promoterPct = Math.round((row.promoters / row.total) * 100);
          
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.dimension}</TableCell>
              <TableCell className="text-center">
                <span 
                  className={`font-bold text-lg ${
                    npsScore >= 50 ? 'text-green-600' : 
                    npsScore >= 0 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}
                >
                  {npsScore}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="text-red-600">{row.detractors}</span>
                  <span className="text-xs text-gray-500">({detractorPct}%)</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="text-amber-600">{row.passives}</span>
                  <span className="text-xs text-gray-500">({passivePct}%)</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="text-green-600">{row.promoters}</span>
                  <span className="text-xs text-gray-500">({promoterPct}%)</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{row.total}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
