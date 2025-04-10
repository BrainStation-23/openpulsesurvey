
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Building2, Medal, Trophy } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TopPerformingSBUsChartProps {
  campaignId: string;
  instanceId?: string;
}

type SBUPerformance = {
  rank: number | bigint;
  sbu_name: string;
  total_assigned: number | bigint;
  total_completed: number | bigint;
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

export function TopPerformingSBUsChart({ campaignId, instanceId }: TopPerformingSBUsChartProps) {
  const { data: sbuPerformance, isLoading } = useQuery({
    queryKey: ["sbu-performance", campaignId, instanceId],
    queryFn: async () => {
      if (!instanceId) return [];

      const { data, error } = await supabase.rpc('get_campaign_sbu_performance', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
      });

      if (error) {
        console.error("Error fetching SBU performance:", error);
        throw error;
      }

      // Convert bigint to number for safe display
      return (data as SBUPerformance[]).map(sbu => ({
        ...sbu,
        rank: Number(sbu.rank),
        total_assigned: Number(sbu.total_assigned),
        total_completed: Number(sbu.total_completed),
        // Ensure avg_score is properly converted from NUMERIC
        avg_score: typeof sbu.avg_score === 'string' ? parseFloat(sbu.avg_score) : Number(sbu.avg_score),
        // Ensure completion_rate is properly converted
        completion_rate: typeof sbu.completion_rate === 'string' ? parseFloat(sbu.completion_rate) : Number(sbu.completion_rate)
      }));
    },
    enabled: !!campaignId && !!instanceId,
  });

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-yellow-500" />
            Top Performing SBUs
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!sbuPerformance || sbuPerformance.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-yellow-500" />
            Top Performing SBUs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for SBU performance.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-yellow-500" />
          Top Performing SBUs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sbuPerformance.map((sbu) => (
              <TableRow key={sbu.sbu_name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(sbu.rank)}
                    #{sbu.rank}
                  </div>
                </TableCell>
                <TableCell>{sbu.sbu_name}</TableCell>
                <TableCell className="text-right">{sbu.total_assigned}</TableCell>
                <TableCell className="text-right">{sbu.total_completed}</TableCell>
                <TableCell className="text-right font-medium">
                  {sbu.avg_score.toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {sbu.completion_rate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
