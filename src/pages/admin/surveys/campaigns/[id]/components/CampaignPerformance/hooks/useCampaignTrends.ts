import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, subDays } from "date-fns";
import { TrendDataPoint, CompletionRateDataPoint, ResponseVolumeDataPoint, TrendMetric, CampaignInstance } from "../types";

export function useCampaignTrends(campaignId: string, instances: CampaignInstance[]) {
  // Helper function to calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const { data: trendData, isLoading: isLoadingTrends } = useQuery({
    queryKey: ["campaign-trends", campaignId],
    queryFn: async () => {
      // Get all responses for this campaign
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          created_at,
          user_id,
          campaign_instance_id,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");

      if (error) throw error;
      
      // Process the data by date
      const responsesByDate = responses.reduce((acc: Record<string, TrendDataPoint>, response) => {
        const date = format(parseISO(response.created_at), "yyyy-MM-dd");
        const instance = instances.find(i => i.id === response.campaign_instance_id);
        
        if (!acc[date]) {
          acc[date] = {
            date: format(parseISO(date), "MMM d"),
            responseCount: 0,
            uniqueRespondents: 0,
            instance: instance?.id,
            periodNumber: instance?.period_number,
          };
        }
        
        acc[date].responseCount++;
        
        // Count unique respondents
        const uniqueUsers = new Set<string>();
        responses
          .filter(r => format(parseISO(r.created_at), "yyyy-MM-dd") === date)
          .forEach(r => uniqueUsers.add(r.user_id));
        
        acc[date].uniqueRespondents = uniqueUsers.size;
        
        return acc;
      }, {});
      
      // Convert to array
      return Object.values(responsesByDate).sort((a, b) => 
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
      );
    },
  });

  const { data: completionRates, isLoading: isLoadingCompletion } = useQuery({
    queryKey: ["campaign-completion-rates", campaignId],
    queryFn: async () => {
      const completionData: CompletionRateDataPoint[] = [];
      
      // For each instance, get the completion rate
      for (const instance of instances) {
        // Get total assignments and completed responses for this instance
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("survey_assignments")
          .select("id", { count: 'exact' })
          .eq("campaign_id", campaignId);
          
        if (assignmentError) throw assignmentError;
        
        const { data: responseData, error: responseError } = await supabase
          .from("survey_responses")
          .select("id", { count: 'exact' })
          .eq("campaign_instance_id", instance.id)
          .eq("status", "submitted");
          
        if (responseError) throw responseError;
        
        const totalAssignments = assignmentData?.length || 0;
        const completedResponses = responseData?.length || 0;
        const completionRate = totalAssignments > 0 ? (completedResponses / totalAssignments) * 100 : 0;
          
        completionData.push({
          instance: instance.id,
          periodNumber: instance.period_number,
          completionRate,
          totalAssignments,
          completedResponses,
        });
      }
      
      return completionData.sort((a, b) => a.periodNumber - b.periodNumber);
    },
    enabled: instances && instances.length > 0,
  });

  const { data: responseVolume, isLoading: isLoadingVolume } = useQuery({
    queryKey: ["campaign-response-volume", campaignId],
    queryFn: async () => {
      const volumeData: ResponseVolumeDataPoint[] = [];
      
      // For each instance, get the response count
      for (const instance of instances) {
        const { data, error } = await supabase
          .from("survey_responses")
          .select("id, created_at")
          .eq("campaign_instance_id", instance.id)
          .order("created_at");
          
        if (error) throw error;
        
        if (data) {
          let avgTimeToComplete;
          
          // If we have submission timestamps, calculate average time to complete
          if (data.length > 0 && instance.starts_at) {
            const startDate = new Date(instance.starts_at);
            const completionTimes = data.map(r => {
              const submitDate = new Date(r.created_at);
              return (submitDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24); // days
            });
            
            avgTimeToComplete = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
          }
          
          volumeData.push({
            instance: instance.id,
            periodNumber: instance.period_number,
            responseCount: data.length,
            averageTimeToComplete: avgTimeToComplete
          });
        }
      }
      
      return volumeData.sort((a, b) => a.periodNumber - b.periodNumber);
    },
    enabled: instances && instances.length > 0,
  });

  // Calculate key metrics for the summary cards
  const metrics = (): TrendMetric[] => {
    if (!trendData || !completionRates || !responseVolume) {
      return [];
    }
    
    // Total responses across all instances
    const totalResponses = responseVolume.reduce((sum, item) => sum + item.responseCount, 0);
    
    // Calculate previous period data for comparison
    const previousPeriodResponses = responseVolume
      .filter(rv => rv.periodNumber < Math.max(...responseVolume.map(r => r.periodNumber)))
      .reduce((sum, item) => sum + item.responseCount, 0);
    
    const responseGrowth = calculateChange(totalResponses, previousPeriodResponses);
    
    // Average completion rate
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, item) => sum + item.completionRate, 0) / completionRates.length
      : 0;
    
    // Total unique respondents
    const uniqueRespondents = new Set<string>();
    if (trendData.length > 0) {
      const totalUniqueRespondents = trendData.reduce((sum, item) => sum + item.uniqueRespondents, 0);
      
      // Response rate over time trend
      const isIncreasing = trendData.length >= 2 && 
        trendData[trendData.length - 1].responseCount > trendData[0].responseCount;
      
      return [
        {
          label: "Total Responses",
          value: totalResponses,
          change: responseGrowth,
          changeDirection: responseGrowth > 0 ? "positive" : responseGrowth < 0 ? "negative" : "neutral",
          description: "Total responses across all instances"
        },
        {
          label: "Average Completion Rate",
          value: `${avgCompletionRate.toFixed(1)}%`,
          description: "Average completion rate across all instances"
        },
        {
          label: "Unique Respondents",
          value: totalUniqueRespondents,
          description: "Total unique respondents across all instances"
        },
        {
          label: "Response Trend",
          value: isIncreasing ? "Increasing" : "Decreasing",
          changeDirection: isIncreasing ? "positive" : "negative",
          description: "Overall trend in response rate over time"
        }
      ];
    }
    
    return [];
  };

  return {
    trendData,
    completionRates,
    responseVolume: [],
    metrics: [],
    isLoading: isLoadingTrends || isLoadingCompletion
  };
}
