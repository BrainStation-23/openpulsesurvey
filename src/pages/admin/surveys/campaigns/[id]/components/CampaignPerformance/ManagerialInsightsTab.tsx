
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignInstance } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Trophy, 
  Medal, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertCircle,
  Building2
} from "lucide-react";
import { ExportMenu } from "../ReportsTab/components/ExportMenu";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface ManagerialInsightsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

type SBUPerformance = {
  rank: number;
  sbu_name: string;
  total_assigned: number;
  total_completed: number;
  avg_score: number;
  completion_rate: number;
};

type ManagerPerformance = {
  rank: number;
  supervisor_name: string;
  sbu_name: string;
  total_assigned: number;
  total_completed: number;
  avg_score: number;
  completion_rate: number;
};

export function ManagerialInsightsTab({ campaignId, instances }: ManagerialInsightsTabProps) {
  // Get the first selected instance for analysis
  const selectedInstanceId = instances.length > 0 ? instances[0].id : undefined;
  
  const { data: sbuPerformance, isLoading: isLoadingSBUs } = useQuery({
    queryKey: ["campaign-sbu-performance", campaignId, selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return [];
      
      const { data, error } = await supabase.rpc(
        'get_campaign_sbu_performance',
        {
          p_campaign_id: campaignId,
          p_instance_id: selectedInstanceId
        }
      );
      
      if (error) throw error;
      return data as SBUPerformance[];
    },
    enabled: !!campaignId && !!selectedInstanceId
  });
  
  const { data: managerPerformance, isLoading: isLoadingManagers } = useQuery({
    queryKey: ["campaign-supervisor-performance", campaignId, selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return [];
      
      const { data, error } = await supabase.rpc(
        'get_campaign_supervisor_performance',
        {
          p_campaign_id: campaignId,
          p_instance_id: selectedInstanceId
        }
      );
      
      if (error) throw error;
      return data as ManagerPerformance[];
    },
    enabled: !!campaignId && !!selectedInstanceId
  });
  
  // For areas needing attention, we'll use the same manager performance data
  // but sort by lowest scores and take the bottom 5
  const managersNeedingImprovement = managerPerformance 
    ? [...managerPerformance]
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, 5)
    : [];
  
  const isLoading = isLoadingSBUs || isLoadingManagers;
  
  // No data to display
  if (!isLoading && (!sbuPerformance?.length && !managerPerformance?.length)) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No managerial insights data available for this campaign instance</p>
      </div>
    );
  }
  
  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Department Performance Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow-500" />
              Top Performing Departments
            </CardTitle>
          </div>
          {sbuPerformance?.length > 0 && (
            <ExportMenu
              chartId="department-performance-chart"
              fileName="department_performance"
              data={sbuPerformance}
            />
          )}
        </CardHeader>
        <CardContent>
          {sbuPerformance?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="overflow-x-auto" id="department-performance-chart">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sbuPerformance.map((sbu) => (
                      <TableRow key={`sbu-${sbu.rank}-${sbu.sbu_name}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(sbu.rank)}
                            #{sbu.rank}
                          </div>
                        </TableCell>
                        <TableCell>{sbu.sbu_name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {sbu.avg_score.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {sbu.completion_rate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sbuPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sbu_name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}`, 'Score']}
                    />
                    <Legend />
                    <Bar dataKey="avg_score" name="Score" fill="#8884d8">
                      {sbuPerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#8884d8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No department performance data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Managers Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Managers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performing Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {managerPerformance?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managerPerformance.slice(0, 5).map((manager) => (
                    <TableRow key={`manager-${manager.rank}-${manager.supervisor_name}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(manager.rank)}
                          #{manager.rank}
                        </div>
                      </TableCell>
                      <TableCell>{manager.supervisor_name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {manager.avg_score.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {manager.completion_rate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No manager performance data available for the selected period.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Improvement Areas */}
        {managersNeedingImprovement.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Areas Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managersNeedingImprovement.map((manager, index) => (
                    <TableRow key={`improvement-${index}-${manager.supervisor_name}`}>
                      <TableCell className="font-medium">
                        {manager.supervisor_name}
                      </TableCell>
                      <TableCell>{manager.sbu_name}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {manager.avg_score.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {manager.completion_rate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Export Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Full Analysis
        </Button>
      </div>
    </div>
  );
}
