
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessedResult } from "../../types/responses";

interface ComparisonViewProps {
  data: ProcessedResult;
  isNps: boolean;
}

export function ComparisonView({ data, isNps }: ComparisonViewProps) {
  // This is a placeholder component for the ComparisonView
  // It will be implemented in the future when the comparison feature is revamped
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison View ({isNps ? 'NPS' : 'Rating'})</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          The comparison view is currently being reimplemented.
        </p>
      </CardContent>
    </Card>
  );
}
