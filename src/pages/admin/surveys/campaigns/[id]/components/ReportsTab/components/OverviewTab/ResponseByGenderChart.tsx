
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseByGenderChartProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseByGenderChart({ campaignId, instanceId }: ResponseByGenderChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response by Gender</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Response by Gender Chart</div>
      </CardContent>
    </Card>
  );
}
