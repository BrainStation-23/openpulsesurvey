
import React, { useState } from 'react';
import { useReporteeFeedback } from '@/hooks/useReporteeFeedback';
import { CampaignSelector } from '@/components/shared/feedback/CampaignSelector';
import { InstanceSelector } from '@/components/shared/feedback/InstanceSelector';
import { FeedbackOverview } from '@/components/shared/feedback/FeedbackOverview';
import { EnhancedQuestionCard } from '@/components/shared/feedback/EnhancedQuestionCard';
import { QuestionComparisonTable } from '@/components/shared/feedback/QuestionComparisonTable';
import { AIAnalysisCard } from '@/components/shared/feedback/AIAnalysisCard';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReporteeFeedbackPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>(undefined);
  
  // Use the reportee feedback hook to get the team feedback data
  const { feedbackData, isLoading, error } = useReporteeFeedback(selectedCampaignId, selectedInstanceId);

  // Extract questions data
  const questions = feedbackData?.data?.questions || [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
        <p className="text-muted-foreground">
          View and analyze feedback from your team members across different survey periods.
        </p>
      </div>

      <Separator className="my-4" />

      {/* Selector section - now at the top */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Campaign & Instance</CardTitle>
          <CardDescription>
            Choose a campaign and specific instance to view feedback data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Campaign</label>
              <CampaignSelector
                selectedCampaignId={selectedCampaignId}
                onCampaignSelect={setSelectedCampaignId}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Instance</label>
              <InstanceSelector
                campaignId={selectedCampaignId}
                selectedInstanceId={selectedInstanceId}
                onInstanceSelect={setSelectedInstanceId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="w-full space-y-6">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-destructive">
                  Error loading feedback data: {error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No campaign/instance selected */}
        {!selectedCampaignId && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  Please select a campaign and instance to view feedback data
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data available */}
        {selectedCampaignId && selectedInstanceId && !isLoading && feedbackData?.status === 'error' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  {feedbackData?.message || 'No feedback data available for this campaign and instance'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main feedback display */}
        {selectedCampaignId && selectedInstanceId && !isLoading && feedbackData?.status === 'success' && feedbackData?.data && (
          <>
            {/* Overview metrics */}
            <FeedbackOverview data={feedbackData.data} isLoading={isLoading} />

            {/* Tabs for different views */}
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="individual">Individual Questions</TabsTrigger>
                <TabsTrigger value="comparison">Comparison Table</TabsTrigger>
                <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              </TabsList>

              {/* Individual questions view */}
              <TabsContent value="individual" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Question-by-Question Analysis</CardTitle>
                    <CardDescription>
                      Detailed breakdown of each question with visualizations and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {questions.map(question => (
                      <div key={question.question_name} className="w-full">
                        <EnhancedQuestionCard question={question} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comparison table view */}
              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Question Comparison</CardTitle>
                    <CardDescription>
                      Side-by-side comparison of all questions and their scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuestionComparisonTable questions={questions} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis tab */}
              <TabsContent value="ai-analysis" className="space-y-6">
                <AIAnalysisCard 
                  campaignId={selectedCampaignId} 
                  instanceId={selectedInstanceId}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
