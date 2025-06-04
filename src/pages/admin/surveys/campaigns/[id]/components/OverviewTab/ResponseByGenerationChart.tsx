
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResponseByGenerationChartProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseByGenerationChart({ campaignId, instanceId }: ResponseByGenerationChartProps) {
  const { data: generationData, isLoading } = useQuery({
    queryKey: ["response-by-generation", campaignId, instanceId],
    queryFn: async () => {
      let query = supabase
        .from("survey_responses")
        .select(`
          generation,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .eq("status", "submitted");

      if (instanceId) {
        query = query.eq("campaign_instance_id", instanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by generation and count responses
      const generationGroups = data.reduce((acc: Record<string, number>, response) => {
        if (response.generation) {
          acc[response.generation] = (acc[response.generation] || 0) + 1;
        }
        return acc;
      }, {});

      const total = Object.values(generationGroups).reduce((sum, count) => sum + count, 0);

      return Object.entries(generationGroups)
        .map(([generation, count]) => ({
          name: generation,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => {
          // Sort generations by chronological order
          const order = ["Baby Boomer", "Generation X", "Millennial", "Generation Z", "Generation Alpha", "Other"];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
    },
    enabled: !!campaignId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rate by Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generationData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rate by Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No generation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rate by Generation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-4">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={[
                            {
                              name: "Responses",
                              value: `${data.count} (${data.percentage.toFixed(1)}%)`,
                              color: "#22c55e"
                            }
                          ]}
                          label={label}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="table" className="mt-4">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Generation</th>
                    <th className="text-right p-3 font-medium">Responses</th>
                    <th className="text-right p-3 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {generationData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.name}</td>
                      <td className="text-right p-3">{item.count}</td>
                      <td className="text-right p-3">{item.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
