
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DemographicBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demographic Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Demographic analysis has been moved to the campaign performance section.
        </p>
      </CardContent>
    </Card>
  );
}
