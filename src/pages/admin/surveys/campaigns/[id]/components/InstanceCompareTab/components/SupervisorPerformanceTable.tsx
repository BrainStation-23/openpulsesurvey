
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupervisorPerformer } from "../types/instance-comparison";
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp, Bookmark } from "lucide-react";

interface SupervisorPerformanceTableProps {
  data: SupervisorPerformer[];
}

export function SupervisorPerformanceTable({ data }: SupervisorPerformanceTableProps) {
  // Function to get trend indicator based on change
  const getTrendIndicator = (change: number) => {
    if (change > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < -0.5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Function to get rank change display
  const getRankChangeDisplay = (rankChange: number) => {
    if (rankChange < 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-4 w-4 mr-1" />
          {Math.abs(rankChange)}
        </div>
      );
    }
    if (rankChange > 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-4 w-4 mr-1" />
          {Math.abs(rankChange)}
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-500">
        <Minus className="h-4 w-4 mr-1" />
        0
      </div>
    );
  };

  // Function to get score display with change
  const getScoreDisplay = (baseScore: number, comparisonScore: number) => {
    const change = comparisonScore - baseScore;
    const changeText = change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    const changeClass = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    
    return (
      <div>
        <span>{comparisonScore.toFixed(2)}</span>
        <span className={`ml-2 text-xs ${changeClass}`}>({changeText})</span>
      </div>
    );
  };

  // Function to get status badge
  const getStatusBadge = (category: string | undefined) => {
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
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Base Score</TableHead>
                <TableHead className="text-right">Current Score</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Rank Change</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((manager, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {manager.base_rank <= 3 && (
                        <Bookmark className={`h-4 w-4 ${
                          manager.base_rank === 1 ? 'text-yellow-500' : 
                          manager.base_rank === 2 ? 'text-gray-400' : 
                          'text-amber-600'
                        }`} />
                      )}
                      #{manager.base_rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{manager.name}</div>
                    {manager.department && (
                      <div className="text-xs text-muted-foreground">{manager.department}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{manager.base_score.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {getScoreDisplay(manager.base_score, manager.comparison_score)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIndicator(manager.change)}
                      <span className={
                        manager.change > 0 ? "text-green-600" : 
                        manager.change < 0 ? "text-red-600" : ""
                      }>
                        {manager.change > 0 ? "+" : ""}
                        {manager.change.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {getRankChangeDisplay(manager.rank_change)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(manager.category)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
