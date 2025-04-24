
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
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "./components/BarChart";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdvancedAnalyticsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

interface SentimentAnalysisResult {
  individual_analysis: {
    sentiment_score: number;
    sentiment_category: "positive" | "neutral" | "negative";
    confidence: number;
    key_themes: string[];
    response_text: string;
  }[];
  aggregate_data: {
    average_sentiment: number;
    sentiment_distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    confidence_average: number;
    themes: {
      theme: string;
      count: number;
    }[];
    metadata: any;
  };
}

export function AdvancedAnalyticsTab({ campaignId, instances }: AdvancedAnalyticsTabProps) {
  const [selectedInsightType, setSelectedInsightType] = useState("sentiment");
  
  // Get the responses with their text data for sentiment analysis
  const { data: textResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ["campaign-text-responses", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return [];
      }
      
      // Get survey structure first to find text/comment questions
      const { data: campaign } = await supabase
        .from("survey_campaigns")
        .select(`
          survey:surveys (
            id,
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();
      
      if (!campaign?.survey?.json_data) return [];
      
      let surveyData;
      try {
        surveyData = typeof campaign.survey.json_data === 'string' 
          ? JSON.parse(campaign.survey.json_data) 
          : campaign.survey.json_data;
      } catch (e) {
        console.error("Error parsing survey data:", e);
        return [];
      }
      
      // Extract text/comment question names
      const textQuestionNames = [];
      
      if (surveyData.pages) {
        for (const page of surveyData.pages) {
          if (page.elements) {
            for (const element of page.elements) {
              if (element.type === 'text' || element.type === 'comment') {
                textQuestionNames.push(element.name);
              }
            }
          }
        }
      }
      
      if (textQuestionNames.length === 0) return [];
      
      // Get responses for these text questions
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          campaign_instance_id
        `)
        .in("campaign_instance_id", instanceIds)
        .eq("status", "submitted");
      
      if (error) throw error;
      
      // Extract text responses from all comment/text fields
      const allTextResponses = [];
      
      responses.forEach(response => {
        for (const questionName of textQuestionNames) {
          const answer = response.response_data[questionName];
          if (answer && typeof answer === 'string' && answer.trim().length > 0) {
            allTextResponses.push({
              text: answer,
              instanceId: response.campaign_instance_id,
              submittedAt: response.submitted_at
            });
          }
        }
      });
      
      return allTextResponses;
    },
    enabled: instances?.length > 0
  });

  // Run sentiment analysis on the text responses
  const { data: sentimentAnalysis, isLoading: isLoadingSentiment } = useQuery<SentimentAnalysisResult>({
    queryKey: ["sentiment-analysis", campaignId, textResponses?.length],
    queryFn: async () => {
      if (!textResponses || textResponses.length === 0) {
        throw new Error("No text responses to analyze");
      }
      
      // Extract just the text strings for analysis
      const textStrings = textResponses.map(r => r.text);
      
      // Add metadata about instances
      const metadata = {
        campaignId,
        instanceIds: instances.map(i => i.id),
        instancePeriods: instances.map(i => i.period_number),
        totalResponses: textResponses.length
      };
      
      // Call the sentiment analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { textResponses: textStrings, metadata },
      });
      
      if (error) throw error;
      return data as SentimentAnalysisResult;
    },
    enabled: textResponses && textResponses.length > 0
  });

  // Group text responses by instance for time-based analysis
  const { data: sentimentByInstance } = useQuery({
    queryKey: ["sentiment-by-instance", sentimentAnalysis, textResponses, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      if (!sentimentAnalysis || !textResponses) {
        return [];
      }
      
      // Group responses by instance
      const instanceMap = new Map();
      
      instances.forEach(instance => {
        instanceMap.set(instance.id, {
          name: `Period ${instance.period_number}`,
          instanceId: instance.id,
          sentimentScores: [],
          count: 0
        });
      });
      
      // Match individual sentiment scores to instances
      textResponses.forEach((response, index) => {
        const sentimentData = sentimentAnalysis.individual_analysis[index];
        if (sentimentData && instanceMap.has(response.instanceId)) {
          const instanceData = instanceMap.get(response.instanceId);
          instanceData.sentimentScores.push(sentimentData.sentiment_score);
          instanceData.count++;
        }
      });
      
      // Calculate average sentiment per instance
      return Array.from(instanceMap.values())
        .map(instance => ({
          name: instance.name,
          sentiment: instance.sentimentScores.length > 0 
            ? instance.sentimentScores.reduce((a, b) => a + b, 0) / instance.sentimentScores.length 
            : 0,
          count: instance.count
        }))
        .filter(instance => instance.count > 0)
        .sort((a, b) => {
          // Extract period numbers for sorting
          const periodA = parseInt(a.name.replace('Period ', ''), 10);
          const periodB = parseInt(b.name.replace('Period ', ''), 10);
          return periodA - periodB;
        });
    },
    enabled: !!sentimentAnalysis && !!textResponses && instances?.length > 0
  });

  // Prepare data for response times
  const { data: responseTimeData, isLoading: isLoadingResponseTimes } = useQuery({
    queryKey: ["response-time-data", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return [];
      }
      
      // Get responses to analyze completion times
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          created_at,
          submitted_at,
          campaign_instance_id
        `)
        .in("campaign_instance_id", instanceIds)
        .eq("status", "submitted");
      
      if (error) throw error;
      
      // Get instance info for mapping
      const instanceMap = new Map();
      instances.forEach(instance => {
        instanceMap.set(instance.id, `Period ${instance.period_number}`);
      });
      
      // Calculate time to complete
      return responses
        .filter(r => r.submitted_at && r.created_at)
        .map(r => {
          const startTime = new Date(r.created_at);
          const endTime = new Date(r.submitted_at);
          const minutesTaken = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          
          return {
            instanceName: instanceMap.get(r.campaign_instance_id) || 'Unknown',
            minutesTaken: Math.min(minutesTaken, 60), // Cap at 60 minutes for outliers
            timestamp: r.submitted_at
          };
        });
    },
    enabled: instances?.length > 0
  });

  // Get participation data by time of day
  const { data: participationTimes, isLoading: isLoadingParticipation } = useQuery({
    queryKey: ["participation-times", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      const instanceIds = instances.map(i => i.id);
      
      if (instanceIds.length === 0) {
        return [];
      }
      
      // Get responses to analyze completion times
      const { data: responses, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          submitted_at,
          campaign_instance_id
        `)
        .in("campaign_instance_id", instanceIds)
        .eq("status", "submitted");
      
      if (error) throw error;
      
      // Count responses by hour
      const hourCounts = Array(24).fill(0);
      
      responses.forEach(r => {
        if (r.submitted_at) {
          const hour = new Date(r.submitted_at).getHours();
          hourCounts[hour]++;
        }
      });
      
      return hourCounts.map((count, hour) => ({
        hour,
        count,
        label: `${hour}:00`
      }));
    },
    enabled: instances?.length > 0
  });

  // Bundle all data for the insights table
  const analyticData = {
    sentimentData: sentimentByInstance || [],
    responseTimeData: responseTimeData || [],
    participationTimes: participationTimes || [],
    keywordData: sentimentAnalysis?.aggregate_data?.themes?.map(t => ({ text: t.theme, value: t.count })) || []
  };

  const isLoading = isLoadingResponses || isLoadingSentiment || isLoadingResponseTimes || isLoadingParticipation;
  const hasNoData = !isLoading && (!textResponses?.length || !sentimentByInstance?.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (hasNoData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          There are no text responses available to analyze sentiment. Please ensure your survey includes text or comment questions and has responses.
        </AlertDescription>
      </Alert>
    );
  }

  const sentimentDistribution = sentimentAnalysis?.aggregate_data?.sentiment_distribution || { 
    positive: 0, neutral: 0, negative: 0 
  };
  
  const totalSentimentResponses = 
    sentimentDistribution.positive + 
    sentimentDistribution.neutral + 
    sentimentDistribution.negative;
  
  const formattedSentimentData = [
    { 
      name: "Positive", 
      value: sentimentDistribution.positive,
      percent: totalSentimentResponses ? (sentimentDistribution.positive / totalSentimentResponses) * 100 : 0
    },
    { 
      name: "Neutral", 
      value: sentimentDistribution.neutral,
      percent: totalSentimentResponses ? (sentimentDistribution.neutral / totalSentimentResponses) * 100 : 0
    },
    { 
      name: "Negative", 
      value: sentimentDistribution.negative,
      percent: totalSentimentResponses ? (sentimentDistribution.negative / totalSentimentResponses) * 100 : 0
    }
  ];
  
  const keyTopics = sentimentAnalysis?.aggregate_data?.themes || [];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sentiment" onClick={() => setSelectedInsightType("sentiment")}>
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger value="keywords" onClick={() => setSelectedInsightType("keywords")}>
            Common Topics
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
                  <LineChart data={sentimentByInstance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}`, 'Sentiment Score']} />
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
                <SentimentAnalysisChart data={formattedSentimentData} />
                <div className="flex justify-center mt-4 gap-2">
                  <Badge variant="outline" className="bg-green-100">
                    Positive: {sentimentDistribution.positive} ({Math.round(formattedSentimentData[0].percent)}%)
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100">
                    Neutral: {sentimentDistribution.neutral} ({Math.round(formattedSentimentData[1].percent)}%)
                  </Badge>
                  <Badge variant="outline" className="bg-red-100">
                    Negative: {sentimentDistribution.negative} ({Math.round(formattedSentimentData[2].percent)}%)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Common Themes & Topics</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {keyTopics.length > 0 ? (
                <WordCloudChart words={keyTopics.map(topic => ({ text: topic.theme, value: topic.count }))} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No common topics found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="times" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Volume By Period</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={sentimentByInstance} 
                  xAxisKey="name" 
                  yAxisKey="count" 
                  labelKey="Response Count"
                  colors={['#8884d8']}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time to Complete Survey</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeData.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="instanceName" />
                    <YAxis domain={[0, 'dataMax']} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} mins`, 'Completion Time']} />
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
                <AreaChart data={participationTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
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
