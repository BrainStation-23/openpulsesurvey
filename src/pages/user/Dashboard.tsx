
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Sigma, Calendar, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from "date-fns";

interface DashboardStats {
  total_points: number;
  completed_surveys: number;
  achievements_unlocked: number;
  response_rate: number;
}

export default function UserDashboard() {
  const { data: pendingSurveysCount } = usePendingSurveysCount();
  
  // Fetch user's dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get achievements count and total points
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, achievements!inner(points)', { count: 'exact' })
        .eq('user_id', user.id);

      // Get survey completion stats
      const { data: surveyStats } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'submitted');

      // Calculate total assignments for response rate
      const { count: totalAssignments } = await supabase
        .from('survey_assignments')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      const totalPoints = achievements?.reduce((sum, a) => sum + (a.achievements?.points || 0), 0) || 0;
      const completedSurveys = surveyStats?.length || 0;
      const responseRate = totalAssignments ? (completedSurveys / totalAssignments) * 100 : 0;

      return {
        total_points: totalPoints,
        completed_surveys: completedSurveys,
        achievements_unlocked: achievements?.length || 0,
        response_rate: responseRate
      } as DashboardStats;
    }
  });

  // Fetch response trends
  const { data: trendData } = useQuery({
    queryKey: ['response-trends'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data } = await supabase
        .from('survey_responses')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

      // Group responses by date
      const grouped = (data || []).reduce((acc: Record<string, number>, response) => {
        const date = format(new Date(response.created_at), 'MMM d');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        responses: count
      }));
    }
  });

  if (isStatsLoading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Surveys</CardTitle>
            <Sigma className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed_surveys || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Surveys</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSurveysCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.response_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="#8884d8" 
                    name="Responses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unlocked</span>
                <span className="font-medium">{stats?.achievements_unlocked || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Points Earned</span>
                <span className="font-medium">{stats?.total_points || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="font-medium">{stats?.response_rate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
