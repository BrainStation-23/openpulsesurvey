
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type GenderStats = {
  gender: string;
  total_assignments: number;
  completed_assignments: number;
  response_rate: number;
};

type Props = {
  campaignId: string;
  instanceId?: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export function ResponseByGenderChart({ campaignId, instanceId }: Props) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["gender-response-rates", campaignId, instanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            gender
          ),
          responses:survey_responses!survey_responses_assignment_id_fkey (
            id,
            campaign_instance_id
          )
        `)
        .eq("campaign_id", campaignId);

      if (instanceId) {
        query.eq("survey_responses.campaign_instance_id", instanceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to calculate stats by gender
      const genderMap = new Map<string, GenderStats>();

      data?.forEach((assignment) => {
        const gender = assignment.user?.gender || "Not Specified";
        const current = genderMap.get(gender) || {
          gender,
          total_assignments: 0,
          completed_assignments: 0,
          response_rate: 0,
        };

        current.total_assignments += 1;
        if (assignment.responses?.length > 0) {
          current.completed_assignments += 1;
        }

        genderMap.set(gender, current);
      });

      // Calculate response rates and convert to array
      return Array.from(genderMap.values()).map((stats) => ({
        ...stats,
        response_rate: Math.round(
          (stats.completed_assignments / stats.total_assignments) * 100
        ),
      }));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (!stats?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Rates by Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No gender data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Rates by Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ gender, response_rate }) => `${gender}: ${response_rate}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="response_rate"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name) => [`${value}%`, "Response Rate"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gender</TableHead>
                  <TableHead className="text-right">Total Assigned</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Response Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.gender}>
                    <TableCell>{stat.gender}</TableCell>
                    <TableCell className="text-right">
                      {stat.total_assignments}
                    </TableCell>
                    <TableCell className="text-right">
                      {stat.completed_assignments}
                    </TableCell>
                    <TableCell className="text-right">{stat.response_rate}%</TableCell>
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
