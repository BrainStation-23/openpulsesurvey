
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusDistributionChartProps {
  data: any[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Status Distribution Chart</div>
      </CardContent>
    </Card>
  );
}
