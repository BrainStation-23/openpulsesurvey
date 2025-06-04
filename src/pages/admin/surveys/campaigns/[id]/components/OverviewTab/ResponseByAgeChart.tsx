
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResponseByAgeChartProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseByAgeChart({ campaignId, instanceId }: ResponseByAgeChartProps) {
  const { data: ageData, isLoading } = useQuery({
    queryKey: ["response-by-age", campaignId, instanceId],
    queryFn: async () => {
      let query = supabase
        .from("survey_responses")
        .select(`
          age,
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

      // Group by age and count responses
      const ageGroups = data.reduce((acc: Record<string, number>, response) => {
        if (response.age !== null && response.age !== undefined) {
          // Group ages into ranges for better visualization
          let ageRange: string;
          if (response.age < 25) ageRange = "Under 25";
          else if (response.age < 35) ageRange = "25-34";
          else if (response.age < 45) ageRange = "35-44";
          else if (response.age < 55) ageRange = "45-54";
          else if (response.age < 65) ageRange = "55-64";
          else ageRange = "65+";

          acc[ageRange] = (acc[ageRange] || 0) + 1;
        }
        return acc;
      }, {});

      const total = Object.values(ageGroups).reduce((sum, count) => sum + count, 0);

      return Object.entries(ageGroups)
        .map(([age, count]) => ({
          name: age,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => {
          const order = ["Under 25", "25-34", "35-44", "45-54", "55-64", "65+"];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
    },
    enabled: !!campaignId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rate by Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ageData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rate by Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No age data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rate by Age</CardTitle>
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
                <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={(props) => {
                      if (!props.active || !props.payload?.length) return null;
                      const data = props.payload[0]?.payload;
                      if (!data) return null;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="font-medium">{props.label}</div>
                            <div className="text-sm">
                              Responses: {data.count} ({data.percentage.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="table" className="mt-4">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Age Range</th>
                    <th className="text-right p-3 font-medium">Responses</th>
                    <th className="text-right p-3 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {ageData.map((item, index) => (
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
