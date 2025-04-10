
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Medal, Trophy, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TopPerformingManagersChartProps {
  campaignId: string;
  instanceId?: string;
}

type ManagerPerformance = {
  rank: number;
  supervisor_name: string;
  sbu_name: string;
  total_assigned: number;
  total_completed: number;
  avg_score: number;
  completion_rate: number;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-blue-500" />;
  }
};

export function TopPerformingManagersChart({ campaignId, instanceId }: TopPerformingManagersChartProps) {
  const { data: managerPerformance, isLoading } = useQuery({
    queryKey: ["manager-performance", campaignId, instanceId],
    queryFn: async () => {
      if (!instanceId) return [];

      const { data, error } = await supabase.rpc('get_campaign_supervisor_performance', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
      });

      if (error) {
        console.error("Error fetching manager performance:", error);
        throw error;
      }

      return data as ManagerPerformance[];
    },
    enabled: !!campaignId && !!instanceId,
  });

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Top Performing Managers
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!managerPerformance || managerPerformance.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Top Performing Managers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for manager performance.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Top Performing Managers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managerPerformance.map((manager) => (
              <TableRow key={`${manager.supervisor_name}-${manager.rank}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(manager.rank)}
                    #{manager.rank}
                  </div>
                </TableCell>
                <TableCell>{manager.supervisor_name}</TableCell>
                <TableCell>{manager.sbu_name}</TableCell>
                <TableCell className="text-right">{manager.total_assigned}</TableCell>
                <TableCell className="text-right">{manager.total_completed}</TableCell>
                <TableCell className="text-right font-medium">
                  {manager.avg_score.toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {manager.completion_rate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
