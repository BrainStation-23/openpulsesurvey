
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

export function ManagerialInsightsTab({ campaignId, instances }: ManagerialInsightsTabProps) {
  const { data: managerialData, isLoading } = useQuery({
    queryKey: ["campaign-managerial-insights", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return {
          departmentPerformance: [],
          managersPerformance: [],
          attentionAreas: []
        };
      }
      
      // Fetch top performing SBUs
      const { data: topSBUs, error: sbuError } = await supabase
        .from("top_performing_sbus")
        .select("*")
        .order("rank");
        
      if (sbuError) throw sbuError;
      
      // Fetch top performing managers
      const { data: topManagers, error: managerError } = await supabase
        .from("top_performing_managers")
        .select("*")
        .order("rank")
        .limit(10);
        
      if (managerError) throw managerError;
      
      // Fetch managers needing improvement
      const { data: improvementManagers, error: improvementError } = await supabase
        .from("managers_needing_improvement")
        .select("*")
        .order("improvement_rank")
        .limit(5);
        
      if (improvementError) throw improvementError;
      
      return {
        departmentPerformance: topSBUs || [],
        managersPerformance: topManagers || [],
        attentionAreas: improvementManagers || []
      };
    },
    enabled: instances?.length > 0
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!managerialData || Object.values(managerialData).every(arr => !arr.length)) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No managerial insights data available for this campaign</p>
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
          <ExportMenu
            chartId="department-performance-chart"
            fileName="department_performance"
            data={managerialData.departmentPerformance}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto" id="department-performance-chart">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Respondents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managerialData.departmentPerformance.map((sbu: any) => (
                    <TableRow key={sbu.sbu_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(sbu.rank)}
                          #{sbu.rank}
                        </div>
                      </TableCell>
                      <TableCell>{sbu.sbu_name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {sbu.average_score !== null ? `${sbu.average_score.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">{sbu.total_respondents}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={managerialData.departmentPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sbu_name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average_score" name="Score (%)" fill="#8884d8">
                    {managerialData.departmentPerformance.map((entry: any, index: number) => (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managerialData.managersPerformance.slice(0, 5).map((manager: any) => (
                  <TableRow key={manager.manager_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankIcon(manager.rank)}
                        #{manager.rank}
                      </div>
                    </TableCell>
                    <TableCell>{manager.manager_name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {manager.average_score.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Improvement Areas */}
        {managerialData.attentionAreas.length > 0 && (
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
                    <TableHead>Priority</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managerialData.attentionAreas.map((manager: any, index: number) => (
                    <TableRow key={manager.manager_id}>
                      <TableCell className="font-medium">
                        #{manager.improvement_rank}
                      </TableCell>
                      <TableCell>{manager.manager_name}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {manager.average_score.toFixed(1)}%
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
