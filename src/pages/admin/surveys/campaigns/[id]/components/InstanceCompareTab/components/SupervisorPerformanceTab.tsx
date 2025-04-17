
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useTopManagersComparison } from "../hooks/useTopManagersComparison";

interface SupervisorPerformanceTabProps {
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function SupervisorPerformanceTab({ baseInstanceId, comparisonInstanceId }: SupervisorPerformanceTabProps) {
  const { data: managersComparison, isLoading: isLoadingManagersComparison } = useTopManagersComparison(
    baseInstanceId,
    comparisonInstanceId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supervisor Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingManagersComparison ? (
          <div>Loading supervisor comparison data...</div>
        ) : managersComparison && managersComparison.length > 0 ? (
          <ResponsiveTable>
            <ResponsiveTable.Header>
              <ResponsiveTable.Row>
                <ResponsiveTable.Head className="text-left">Manager</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Base Score</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Base Rank</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Comparison Score</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Comparison Rank</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Change</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Rank Change</ResponsiveTable.Head>
              </ResponsiveTable.Row>
            </ResponsiveTable.Header>
            <ResponsiveTable.Body>
              {managersComparison.map((manager) => (
                <ResponsiveTable.Row key={manager.name} className="hover:bg-muted/50">
                  <ResponsiveTable.Cell className="font-medium">{manager.name}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell className="text-right">{manager.base_score.toFixed(2)}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell className="text-right">{manager.base_rank}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell className="text-right">{manager.comparison_score.toFixed(2)}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell className="text-right">{manager.comparison_rank}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell 
                    className={`text-right ${manager.change > 0 ? 'text-green-600' : manager.change < 0 ? 'text-red-600' : ''}`}
                  >
                    {manager.change > 0 ? '+' : ''}{manager.change.toFixed(2)}
                  </ResponsiveTable.Cell>
                  <ResponsiveTable.Cell
                    className={`text-right ${manager.rank_change > 0 ? 'text-green-600' : manager.rank_change < 0 ? 'text-red-600' : ''}`}
                  >
                    {manager.rank_change > 0 ? '+' : ''}{manager.rank_change}
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ))}
            </ResponsiveTable.Body>
          </ResponsiveTable>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No supervisor comparison data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
