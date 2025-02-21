
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompletionTrendsProps {
  campaignId: string;
  instanceId?: string;
}

export function CompletionTrends({ campaignId, instanceId }: CompletionTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart implementation will be added later */}
        <div>Completion Trends Chart</div>
      </CardContent>
    </Card>
  );
}
