
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseByEmploymentTypeChartProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseByEmploymentTypeChart({ campaignId, instanceId }: ResponseByEmploymentTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response by Employment Type</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Response by Employment Type Chart</div>
      </CardContent>
    </Card>
  );
}
