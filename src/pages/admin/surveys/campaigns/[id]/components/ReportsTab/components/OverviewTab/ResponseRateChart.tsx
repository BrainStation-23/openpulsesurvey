
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseRateChartProps {
  data: any[];
}

export function ResponseRateChart({ data }: ResponseRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rate</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Response Rate Chart</div>
      </CardContent>
    </Card>
  );
}
