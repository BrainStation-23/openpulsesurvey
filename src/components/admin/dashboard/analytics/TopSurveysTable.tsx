
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopSurveysTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Surveys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Survey performance data will be available soon
        </div>
      </CardContent>
    </Card>
  );
}
