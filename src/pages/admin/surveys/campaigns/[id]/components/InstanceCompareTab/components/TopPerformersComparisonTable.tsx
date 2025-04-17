
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TopSBUPerformer } from "../hooks/useTopSBUComparison";

interface TopPerformersComparisonTableProps {
  title: string;
  icon: React.ReactNode;
  performers: TopSBUPerformer[];
  loading: boolean;
  error: Error | null;
}

export function TopPerformersComparisonTable({
  title,
  icon,
  performers,
  loading,
  error
}: TopPerformersComparisonTableProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data: {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!performers.length) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No performance data available for comparison.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Base Score
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Comparison
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Change
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rank Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {performers.map((performer, index) => (
              <tr key={index} className="hover:bg-muted/50">
                <td className="px-2 py-3 text-sm">{performer.name}</td>
                <td className="px-2 py-3 text-sm text-right">{performer.base_score.toFixed(2)}</td>
                <td className="px-2 py-3 text-sm text-right">{performer.comparison_score.toFixed(2)}</td>
                <td className="px-2 py-3 text-sm text-right">
                  <span
                    className={
                      performer.change > 0
                        ? "text-green-600"
                        : performer.change < 0
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {performer.change > 0 ? "+" : ""}
                    {performer.change.toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-3 text-sm text-right">
                  <span
                    className={
                      performer.rank_change < 0
                        ? "text-green-600"
                        : performer.rank_change > 0
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {performer.rank_change < 0 ? "+" : performer.rank_change > 0 ? "-" : ""}
                    {Math.abs(performer.rank_change) === 999 ? "N/A" : Math.abs(performer.rank_change)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
