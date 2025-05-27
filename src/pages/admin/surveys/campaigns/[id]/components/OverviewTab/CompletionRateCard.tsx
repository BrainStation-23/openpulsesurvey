
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CompletionRateCardProps = {
  completionRate: number | null | undefined;
};

export function CompletionRateCard({ completionRate }: CompletionRateCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Completion Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {completionRate !== null && completionRate !== undefined 
            ? `${completionRate.toFixed(1)}%` 
            : "0.0%"
          }
        </div>
        {completionRate !== null && completionRate !== undefined && (
          <p className="text-xs text-muted-foreground">
            of active users
          </p>
        )}
      </CardContent>
    </Card>
  );
}
