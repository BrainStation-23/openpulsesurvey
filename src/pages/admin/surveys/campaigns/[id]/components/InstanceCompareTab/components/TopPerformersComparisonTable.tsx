
import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Performer {
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
  icon: ReactNode;
  performers: Performer[];
  loading: boolean;
  error?: Error | null;
}

export function TopPerformersComparisonTable({ 
  title, 
  icon, 
  performers, 
  loading,
  error
}: TopPerformersComparisonTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Error loading data: {error.message}</p>
          </div>
        ) : performers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No data available for comparison</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Base Score</TableHead>
                <TableHead className="text-right">Comparison Score</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Rank Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performers.map((performer) => (
                <TableRow key={performer.name}>
                  <TableCell className="font-medium">{performer.name}</TableCell>
                  <TableCell className="text-right">{performer.base_score.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{performer.comparison_score.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center ${getChangeColor(performer.change)}`}>
                      {performer.change !== 0 ? performer.change.toFixed(1) : '0.0'}
                      {getChangeIcon(performer.change)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center ${getRankChangeColor(performer.rank_change)}`}>
                      {performer.rank_change !== 0 ? Math.abs(performer.rank_change) : '0'}
                      {getRankChangeIcon(performer.rank_change)}
                    </span>
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

function getChangeIcon(value: number) {
  if (value > 0) return <ArrowUp className="ml-1 h-4 w-4" />;
  if (value < 0) return <ArrowDown className="ml-1 h-4 w-4" />;
  return <Minus className="ml-1 h-4 w-4" />;
}

function getRankChangeIcon(value: number) {
  if (value < 0) return <ArrowUp className="ml-1 h-4 w-4" />; // Lower number is better rank
  if (value > 0) return <ArrowDown className="ml-1 h-4 w-4" />;
  return <Minus className="ml-1 h-4 w-4" />;
}

function getChangeColor(value: number) {
  if (value > 0) return "text-green-500";
  if (value < 0) return "text-red-500";
  return "text-gray-500";
}

function getRankChangeColor(value: number) {
  if (value < 0) return "text-green-500"; // Lower number is better rank
  if (value > 0) return "text-red-500";
  return "text-gray-500";
}
