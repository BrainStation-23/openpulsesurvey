
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { TopSBUPerformer } from "../types/instance-comparison";

interface TopPerformersComparisonTableProps {
  data: TopSBUPerformer[];
  title?: string;
}

export function TopPerformersComparisonTable({ 
  data, 
  title = "Top Performers Comparison" 
}: TopPerformersComparisonTableProps) {
  // Sort data by rank if needed
  const sortedData = [...data].sort((a, b) => a.comparisonRank - b.comparisonRank);
  
  // Function to render rank change indicator
  const renderRankChange = (rankChange: number) => {
    if (rankChange > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUp className="h-4 w-4 mr-1" /> 
          <span>{rankChange}</span>
        </div>
      );
    }
    
    if (rankChange < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span>{Math.abs(rankChange)}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-gray-400">
        <Minus className="h-4 w-4 mr-1" />
        <span>0</span>
      </div>
    );
  };
  
  // Function to render score change with color
  const renderScoreChange = (change: number) => {
    const formattedChange = change.toFixed(2);
    const absChange = Math.abs(change);
    
    if (change > 0) {
      const intensity = absChange > 1 ? 'text-green-600' : 'text-green-500';
      return <span className={intensity}>+{formattedChange}</span>;
    }
    
    if (change < 0) {
      const intensity = absChange > 1 ? 'text-red-600' : 'text-red-500';
      return <span className={intensity}>{formattedChange}</span>;
    }
    
    return <span className="text-gray-500">0.00</span>;
  };
  
  // Function to get badge for performance category
  const getCategoryBadge = (category?: string) => {
    if (category === 'improved') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Improved</Badge>;
    }
    
    if (category === 'declined') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Declined</Badge>;
    }
    
    return <Badge variant="outline">Stable</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead className="text-right">Base Score</TableHead>
              <TableHead className="text-right">Current Score</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Rank Change</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((sbu, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">#{sbu.comparisonRank}</TableCell>
                <TableCell>{sbu.name}</TableCell>
                <TableCell className="text-right">{sbu.baseScore.toFixed(2)}</TableCell>
                <TableCell className="text-right">{sbu.comparisonScore.toFixed(2)}</TableCell>
                <TableCell className="text-right">{renderScoreChange(sbu.change)}</TableCell>
                <TableCell className="text-right">
                  {renderRankChange(sbu.rankChange)}
                </TableCell>
                <TableCell className="text-right">
                  {getCategoryBadge(sbu.category)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
