
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseByLocationChartProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseByLocationChart({ campaignId, instanceId }: ResponseByLocationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response by Location</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Response by Location Chart</div>
      </CardContent>
    </Card>
  );
}
