
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopPerformerData {
  name: string;
  base_score: number;
  comparison_score: number;
  change: number;
  base_rank: number;
  comparison_rank: number;
  rank_change: number;
}

interface TopPerformersComparisonTableProps {
  title: string;
  icon: React.ReactNode;
  performers: TopPerformerData[];
  loading?: boolean;
}

export function TopPerformersComparisonTable({ 
  title, 
  icon, 
  performers, 
  loading = false 
}: TopPerformersComparisonTableProps) {
  const sortedData = [...performers].sort((a, b) => Math.abs(b.rank_change) - Math.abs(a.rank_change));

  const renderChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getRankChangeLabel = (change: number) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return "0";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {performers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No data available for comparison
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Rank Change</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Previous</TableHead>
                <TableHead className="text-right">Score Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((performer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span className={getChangeColor(-performer.rank_change)}>
                        {getRankChangeLabel(-performer.rank_change)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">#{performer.base_rank}</TableCell>
                  <TableCell className="text-right">#{performer.comparison_rank}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {renderChangeIcon(performer.change)}
                      <span className={getChangeColor(performer.change)}>
                        {performer.change > 0 ? "+" : ""}{performer.change.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
