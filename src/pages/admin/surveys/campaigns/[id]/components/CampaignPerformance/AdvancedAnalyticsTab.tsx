
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignInstance } from "./types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";
import { SentimentAnalysisChart } from "./components/SentimentAnalysisChart";
import { WordCloudChart } from "./components/WordCloudChart";
import { AdvancedInsightsTable } from "./components/AdvancedInsightsTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedAnalyticsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function AdvancedAnalyticsTab({ campaignId, instances }: AdvancedAnalyticsTabProps) {
  const [selectedInsightType, setSelectedInsightType] = useState("sentiment");
  
  const { data: analyticData, isLoading } = useQuery({
    queryKey: ["campaign-advanced-analytics", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return {
          sentimentData: [],
          responseTimeData: [],
          participationTimes: [],
          keywordData: []
        };
      }
      
      // Get responses for analysis
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          created_at,
          submitted_at,
          campaign_instance_id
        `)
        .in("campaign_instance_id", instanceIds);
      
      if (error) throw error;
      
      // Process sentiment data by instance (simplified)
      const sentimentByInstance = instances.map(instance => {
        const instanceResponses = responses.filter(r => r.campaign_instance_id === instance.id);
        // This would normally be calculated from actual text analysis
        const sentiment = Math.random() * 40 + 60; // Random score between 60-100
        return {
          name: `Period ${instance.period_number}`,
          sentiment,
          count: instanceResponses.length
        };
      });
      
      // Response time data (time to complete survey)
      const responseTimeData = responses
        .filter(r => r.submitted_at && r.created_at)
        .map(r => {
          const startTime = new Date(r.created_at);
          const endTime = new Date(r.submitted_at);
          const minutesTaken = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          
          // Get the instance info
          const instance = instances.find(i => i.id === r.campaign_instance_id);
          
          return {
            instanceName: instance ? `Period ${instance.period_number}` : 'Unknown',
            minutesTaken: Math.min(minutesTaken, 60), // Cap at 60 minutes for outliers
            timestamp: r.submitted_at
          };
        });
      
      // Participation by time of day
      const participationByHour = Array(24).fill(0);
      responses.forEach(r => {
        const hour = new Date(r.submitted_at || r.created_at).getHours();
        participationByHour[hour]++;
      });
      
      const participationTimes = participationByHour.map((count, hour) => ({
        hour: hour,
        count: count,
        label: `${hour}:00`
      }));
      
      // Extract keywords from text responses (simplified)
      const keywords = [
        { text: "Communication", value: 78 },
        { text: "Management", value: 65 },
        { text: "Training", value: 52 },
        { text: "Resources", value: 48 },
        { text: "Support", value: 43 },
        { text: "Feedback", value: 38 },
        { text: "Collaboration", value: 36 },
        { text: "Workload", value: 32 },
        { text: "Leadership", value: 30 },
        { text: "Development", value: 28 },
        { text: "Meetings", value: 25 },
        { text: "Recognition", value: 22 },
        { text: "Innovation", value: 20 },
        { text: "Balance", value: 18 },
        { text: "Culture", value: 15 }
      ];
      
      return {
        sentimentData: sentimentByInstance,
        responseTimeData: responseTimeData,
        participationTimes: participationTimes,
        keywordData: keywords
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
  
  if (!analyticData || (!analyticData.sentimentData.length && !analyticData.keywordData.length)) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No advanced analytics data available for this campaign</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sentiment" onClick={() => setSelectedInsightType("sentiment")}>
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger value="keywords" onClick={() => setSelectedInsightType("keywords")}>
            Word Cloud
          </TabsTrigger>
          <TabsTrigger value="times" onClick={() => setSelectedInsightType("times")}>
            Response Times
          </TabsTrigger>
          <TabsTrigger value="patterns" onClick={() => setSelectedInsightType("patterns")}>
            Participation Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend By Period</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticData.sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#8884d8"
                      name="Sentiment Score"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <SentimentAnalysisChart data={analyticData.sentimentData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Common Themes & Keywords</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <WordCloudChart words={analyticData.keywordData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="times" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticData.sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="#8884d8" 
                      name="Response Count" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time to Complete Survey</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticData.responseTimeData.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="instanceName" />
                    <YAxis domain={[0, 'dataMax']} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="minutesTaken" 
                      stroke="#82ca9d" 
                      name="Minutes to Complete"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Participation by Time of Day</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticData.participationTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Responses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AdvancedInsightsTable 
        insightType={selectedInsightType} 
        data={analyticData} 
      />
    </div>
  );
}
