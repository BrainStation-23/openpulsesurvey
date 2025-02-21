
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompletionRateCardProps {
  completionRate: number;
}

export function CompletionRateCard({ completionRate }: CompletionRateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{completionRate}%</div>
      </CardContent>
    </Card>
  );
}
