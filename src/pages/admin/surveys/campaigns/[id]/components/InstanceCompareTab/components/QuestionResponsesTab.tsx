
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionResponsesTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function QuestionResponsesTab({ campaignId, baseInstanceId, comparisonInstanceId }: QuestionResponsesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Response Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Question response comparison will be implemented soon.</div>
      </CardContent>
    </Card>
  );
}
