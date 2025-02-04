import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

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
    <Card>
      <CardHeader>
        <CardTitle>Department Completion Rates</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltipContent 
                      active={active} 
                      payload={payload.map(p => ({
                        ...p,
                        value: `${p.value}%`
                      }))} 
                      label={label}
                    />
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
      </CardContent>
    </Card>
  );
}