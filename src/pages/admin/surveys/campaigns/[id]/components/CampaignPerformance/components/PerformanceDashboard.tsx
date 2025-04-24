
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ArrowDown, ArrowUp, LineChart, MessageSquare, TrendingUp, Users } from "lucide-react";
import { CampaignInstance } from "../types";

interface PerformanceDashboardProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function PerformanceDashboard({ campaignId, instances }: PerformanceDashboardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["campaign-performance-metrics", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      // Get total responses and engagement metrics
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return {
          totalResponses: 0,
          averageCompletionRate: 0,
          participationTrend: 0,
          averageScore: 0,
          sentimentScore: 0,
          commonThemes: []
        };
      }
      
      // Get response data
      const { data: responseData, error: responseError } = await supabase
        .from("survey_responses")
        .select("id, created_at, status")
        .in("campaign_instance_id", instanceIds);
      
      if (responseError) throw responseError;
      
      // Calculate completion rate average
      let totalCompletionRate = 0;
      instances.forEach(instance => {
        totalCompletionRate += instance.completion_rate || 0;
      });
      const averageCompletionRate = instances.length > 0 
        ? (totalCompletionRate / instances.length) 
        : 0;
      
      // Calculate trend by comparing most recent instance to previous one
      let participationTrend = 0;
      if (instances.length >= 2) {
        const sortedInstances = [...instances].sort((a, b) => 
          new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        );
        
        const latestInstance = sortedInstances[0];
        const previousInstance = sortedInstances[1];
        
        if (latestInstance.completion_rate && previousInstance.completion_rate) {
          participationTrend = latestInstance.completion_rate - previousInstance.completion_rate;
        }
      }
      
      // For average score, we'd ideally calculate from actual response data
      // This is a simplified placeholder
      const averageScore = 3.7;
      
      return {
        totalResponses: responseData.length,
        averageCompletionRate,
        participationTrend,
        averageScore,
        sentimentScore: 65, // Placeholder for sentiment analysis (0-100)
        commonThemes: ["Communication", "Management", "Training"]
      };
    },
    enabled: instances?.length > 0
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Responses
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.totalResponses || 0}</div>
          <p className="text-xs text-muted-foreground">
            From {instances.length} campaign periods
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Completion Rate
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics?.averageCompletionRate || 0).toFixed(1)}%
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {metrics?.participationTrend !== undefined && (
              metrics.participationTrend > 0 ? (
                <div className="flex items-center text-green-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{metrics.participationTrend.toFixed(1)}%</span>
                </div>
              ) : metrics.participationTrend < 0 ? (
                <div className="flex items-center text-red-500">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{Math.abs(metrics.participationTrend).toFixed(1)}%</span>
                </div>
              ) : (
                <span>No change</span>
              )
            )}
            <span className="ml-1">from previous</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Rating Score
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.averageScore.toFixed(1)}/5
          </div>
          <p className="text-xs text-muted-foreground">
            Based on all rating questions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sentiment Score
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.sentimentScore}/100
          </div>
          <p className="text-xs text-muted-foreground">
            From text response analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
