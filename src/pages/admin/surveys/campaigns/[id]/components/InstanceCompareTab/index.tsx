
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDualInstanceSelector } from "./components/EnhancedDualInstanceSelector";
import { useTopSBUComparison } from "./hooks/useTopSBUComparison";
import { useTopManagersComparison } from "./hooks/useTopManagersComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export function InstanceCompareTab() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();

  // Use the SBU comparison hook
  const { data: sbuComparison, isLoading: isLoadingSBUComparison } = useTopSBUComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  // Use the managers comparison hook
  const { data: managersComparison, isLoading: isLoadingManagersComparison } = useTopManagersComparison(
    baseInstanceId,
    comparisonInstanceId
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDualInstanceSelector
            campaignId={campaignId || ''}
            baseInstanceId={baseInstanceId}
            comparisonInstanceId={comparisonInstanceId}
            onBaseInstanceSelect={setBaseInstanceId}
            onComparisonInstanceSelect={setComparisonInstanceId}
          />
        </CardContent>
      </Card>

      {baseInstanceId && comparisonInstanceId && (
        <Tabs defaultValue="sbu">
          <TabsList className="mb-4">
            <TabsTrigger value="sbu">SBU Performance</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisor Performance</TabsTrigger>
            <TabsTrigger value="questions">Question Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sbu">
            <Card>
              <CardHeader>
                <CardTitle>SBU Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSBUComparison ? (
                  <div>Loading SBU comparison data...</div>
                ) : sbuComparison && sbuComparison.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">SBU</th>
                          <th className="text-right p-2">Base Score</th>
                          <th className="text-right p-2">Base Rank</th>
                          <th className="text-right p-2">Comparison Score</th>
                          <th className="text-right p-2">Comparison Rank</th>
                          <th className="text-right p-2">Change</th>
                          <th className="text-right p-2">Rank Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sbuComparison.map((sbu) => (
                          <tr key={sbu.name} className="border-b hover:bg-muted/50">
                            <td className="p-2">{sbu.name}</td>
                            <td className="text-right p-2">{sbu.base_score.toFixed(2)}</td>
                            <td className="text-right p-2">{sbu.base_rank}</td>
                            <td className="text-right p-2">{sbu.comparison_score.toFixed(2)}</td>
                            <td className="text-right p-2">{sbu.comparison_rank}</td>
                            <td className={`text-right p-2 ${sbu.change > 0 ? 'text-green-600' : sbu.change < 0 ? 'text-red-600' : ''}`}>
                              {sbu.change > 0 ? '+' : ''}{sbu.change.toFixed(2)}
                            </td>
                            <td className={`text-right p-2 ${sbu.rank_change > 0 ? 'text-green-600' : sbu.rank_change < 0 ? 'text-red-600' : ''}`}>
                              {sbu.rank_change > 0 ? '+' : ''}{sbu.rank_change}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div>No comparison data available.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="supervisors">
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
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Response Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Question response comparison will be implemented soon.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
