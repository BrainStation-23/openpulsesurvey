
import React, { useState, useEffect } from 'react';
import { useReporteeFeedback } from '@/hooks/useReporteeFeedback';
import { useTeamFeedbackTrend } from '@/hooks/useTeamFeedbackTrend';
import { CampaignSelector } from './components/CampaignSelector';
import { TrendLineChart } from './components/TrendLineChart';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedbackTrendPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined);
  
  // Use the reportee feedback hook to get the list of campaigns
  const { feedbackData: campaignListData, isLoading: isLoadingCampaigns } = useReporteeFeedback();
  
  // Use the team feedback trend hook to get the trend data
  const { 
    trendData, 
    isLoading: isLoadingTrend 
  } = useTeamFeedbackTrend(selectedCampaignId);

  // List of campaigns for the selector
  const campaigns = React.useMemo(() => {
    if (!campaignListData?.data?.campaign_info) return [];
    
    // Map the campaign info to match the Campaign interface
    const campaignInfo = campaignListData.data.campaign_info;
    return [{
      id: campaignInfo.campaign_id,
      name: campaignInfo.campaign_name
    }];
  }, [campaignListData?.data?.campaign_info]);

  // Process data for trend visualization
  const ratingQuestions = trendData?.data?.questions?.filter(q => q.question_type === 'rating') || [];
  const booleanQuestions = trendData?.data?.questions?.filter(q => q.question_type === 'boolean') || [];

  // Format data for the trend charts
  const formatTrendData = (question: any) => {
    if (!question.trend_data) return [];
    
    return question.trend_data.map((item: any) => ({
      period_number: item.period_number,
      value: question.question_type === 'boolean' ? 
        (item.yes_percentage || 0) : 
        (item.avg_value || 0),
      responseCount: item.response_count,
      instanceId: item.instance_id
    }));
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">My Feedback Trend</h1>
        <p className="text-muted-foreground">
          View trends of feedback from all your reportees across multiple survey periods.
        </p>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col space-y-6">
        {/* Campaign selector */}
        <div className="flex items-center space-x-4">
          <div className="font-medium">Campaign:</div>
          <CampaignSelector
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaign={setSelectedCampaignId}
            isLoading={isLoadingCampaigns}
          />
        </div>

        {/* Loading state */}
        {isLoadingTrend && (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        )}

        {/* No campaign selected */}
        {!selectedCampaignId && !isLoadingTrend && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  Please select a campaign to view feedback trends
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data available */}
        {selectedCampaignId && !isLoadingTrend && (!trendData?.data || 
          ((!ratingQuestions || ratingQuestions.length === 0) && 
          (!booleanQuestions || booleanQuestions.length === 0))) && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  No feedback trend data available for this campaign
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trend data display */}
        {selectedCampaignId && !isLoadingTrend && trendData?.data && (
          <Tabs defaultValue="rating" className="w-full">
            <TabsList className="mb-4">
              {ratingQuestions.length > 0 && (
                <TabsTrigger value="rating">Rating Questions</TabsTrigger>
              )}
              {booleanQuestions.length > 0 && (
                <TabsTrigger value="boolean">Yes/No Questions</TabsTrigger>
              )}
            </TabsList>

            {/* Rating Questions Tab */}
            {ratingQuestions.length > 0 && (
              <TabsContent value="rating" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Trends Over Time</CardTitle>
                    <CardDescription>
                      Average ratings across different survey periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    {ratingQuestions.map(question => (
                      <TrendLineChart
                        key={question.question_name}
                        title={question.question_title}
                        data={formatTrendData(question)}
                        questionType="rating"
                        color="#8B5CF6" // Purple color for rating questions
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Boolean Questions Tab */}
            {booleanQuestions.length > 0 && (
              <TabsContent value="boolean" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Yes/No Trends Over Time</CardTitle>
                    <CardDescription>
                      Percentage of "Yes" responses across different survey periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    {booleanQuestions.map(question => (
                      <TrendLineChart
                        key={question.question_name}
                        title={question.question_title}
                        data={formatTrendData(question)}
                        questionType="boolean"
                        color="#10B981" // Green color for boolean questions
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
