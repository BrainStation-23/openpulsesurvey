import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export function ResponseTrendChart() {
  const { data: trends, isLoading } = useQuery({
    queryKey: ["response-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("response_trends")
        .select("*")
        .order("response_date");
      
      if (error) throw error;
      
      return data.map(trend => ({
        date: format(parseISO(trend.response_date), "MMM d"),
        responses: trend.response_count,
        respondents: trend.unique_respondents
      }));
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltipContent 
                      active={active} 
                      payload={payload} 
                      label={label}
                    />
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="responses" 
                stroke="#8884d8" 
                name="Total Responses"
              />
              <Line 
                type="monotone" 
                dataKey="respondents" 
                stroke="#82ca9d" 
                name="Unique Respondents"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}