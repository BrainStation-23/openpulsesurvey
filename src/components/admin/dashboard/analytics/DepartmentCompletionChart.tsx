
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DepartmentCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Department performance analysis has been moved to the campaign performance section.
        </p>
      </CardContent>
    </Card>
  );
}
