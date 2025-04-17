
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonDimension } from "../../types/comparison";

interface ComparisonViewProps {
  dimension: ComparisonDimension;
  questionData: any;
}

export function ComparisonView({ dimension, questionData }: ComparisonViewProps) {
  // This is a placeholder component for the ComparisonView
  // It will be implemented in the future when the comparison feature is revamped
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison View ({dimension})</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          The comparison view is currently being reimplemented.
        </p>
      </CardContent>
    </Card>
  );
}
