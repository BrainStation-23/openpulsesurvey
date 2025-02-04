import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";

export function DepartmentCompletionChart() {
  const { data: departmentStats, isLoading } = useQuery({
    queryKey: ["department-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department_performance")
        .select("*")
        .order("completion_rate", { ascending: false });
      
      if (error) throw error;
      
      return data.map(stat => ({
        name: stat.sbu_name,
        completionRate: Number(stat.completion_rate.toFixed(1)),
        totalAssignments: stat.total_assignments,
        completedResponses: stat.completed_responses
      }));
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="overflow-hidden">

      <CardHeader>
        <CardTitle>Department Completion Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="aspect-[16/9] w-full">

            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{label}</p>
                            <p>Completion Rate: {data.completionRate}%</p>
                            <p>Total Assignments: {data.totalAssignments}</p>
                            <p>Completed: {data.completedResponses}</p>
                          </div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="completionRate" 
                    fill="#8884d8" 
                    name="Completion Rate"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Total Assignments</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentStats?.map((stat) => (
                  <TableRow key={stat.name}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell className="text-right">{stat.totalAssignments}</TableCell>
                    <TableCell className="text-right">{stat.completedResponses}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {stat.completionRate}%
                        {stat.completionRate >= 75 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
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

