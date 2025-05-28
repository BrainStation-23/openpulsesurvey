
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = {
  'Submitted': '#10B981', // green
  'In_progress': '#3B82F6', // blue
  'Expired': '#EF4444', // red
  'Assigned': '#F59E0B', // amber
};

type StatusDistributionCardProps = {
  campaignId: string;
  selectedInstanceId?: string;
};

export function StatusDistributionCard({ campaignId, selectedInstanceId }: StatusDistributionCardProps) {
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["status-distribution", campaignId, selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return [];

      const { data, error } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaignId,
          p_instance_id: selectedInstanceId
        });

      if (error) throw error;

      // Ensure all status types have a value
      const defaultStatuses = ['submitted', 'in_progress', 'expired', 'assigned'];
      const statusMap = new Map(data.map(item => [item.status, item.count]));
      
      return defaultStatuses.map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusMap.get(status) || 0
      }));
    },
    enabled: !!selectedInstanceId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statusData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => 
                      `${name} (${((value / total) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS] || '#CBD5E1'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value} (${((value / total) * 100).toFixed(1)}%)`,
                      'Count'
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                    <TableCell className="text-right">
                      {((item.value / total) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
