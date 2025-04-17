
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeltaIndicator } from "./DeltaIndicator";

interface ComparisonCardProps {
  title: string;
  baseValue: number;
  comparisonValue: number;
  formatValue?: (value: number) => string;
  reverseColors?: boolean;
}

export function ComparisonCard({
  title,
  baseValue,
  comparisonValue,
  formatValue = (v) => v.toString(),
  reverseColors,
}: ComparisonCardProps) {
  const delta = ((comparisonValue - baseValue) / baseValue) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatValue(comparisonValue)}</p>
            <p className="text-sm text-muted-foreground">vs {formatValue(baseValue)}</p>
          </div>
          <DeltaIndicator value={delta} reverseColors={reverseColors} />
        </div>
      </CardContent>
    </Card>
  );
}
