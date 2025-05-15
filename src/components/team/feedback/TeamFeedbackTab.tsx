
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCampaignInstances } from '@/hooks/useCampaignInstances';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BarChart4, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionFeedbackList } from './QuestionFeedbackList';
import { QuestionFeedbackDetail } from './QuestionFeedbackDetail';

export const TeamFeedbackTab = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [selectedQuestionName, setSelectedQuestionName] = useState<string | null>(null);
  
  const { data: campaigns, isLoading: isLoadingCampaigns } = useCampaignInstances();
  
  const { 
    data: teamFeedback, 
    isLoading: isLoadingFeedback,
    error: feedbackError 
  } = useTeamFeedback({
    campaignId: selectedCampaignId,
    instanceId: selectedInstanceId,
    questionName: selectedQuestionName || undefined
  });

  const selectedCampaign = campaigns?.find(c => c.id === selectedCampaignId);
  const selectedInstance = selectedCampaign?.instances.find(i => i.id === selectedInstanceId);

  const handleReset = () => {
    setSelectedQuestionName(null);
  };

  const handleQuestionSelect = (questionName: string) => {
    setSelectedQuestionName(questionName);
  };

  if (isLoadingCampaigns) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No campaigns available</AlertTitle>
        <AlertDescription>
          There are no active campaigns to show feedback for.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-6">
        <div className="text-lg font-medium">Team Feedback</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-select">Select Campaign</Label>
            <Select
              value={selectedCampaignId || ""}
              onValueChange={(value) => {
                setSelectedCampaignId(value);
                setSelectedInstanceId(null);
                setSelectedQuestionName(null);
              }}
            >
              <SelectTrigger id="campaign-select">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance-select">Select Instance</Label>
            <Select
              value={selectedInstanceId || ""}
              onValueChange={(value) => {
                setSelectedInstanceId(value);
                setSelectedQuestionName(null);
              }}
              disabled={!selectedCampaignId}
            >
              <SelectTrigger id="instance-select">
                <SelectValue placeholder="Select an instance" />
              </SelectTrigger>
              <SelectContent>
                {selectedCampaign?.instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id}>
                    Period {instance.period_number} ({new Date(instance.starts_at).toLocaleDateString()} - {new Date(instance.ends_at).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCampaignId && selectedInstanceId && (
          <div className="mt-4">
            {isLoadingFeedback ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : feedbackError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading feedback</AlertTitle>
                <AlertDescription>
                  {feedbackError.message}
                </AlertDescription>
              </Alert>
            ) : teamFeedback?.status === 'error' ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No team feedback available</AlertTitle>
                <AlertDescription>
                  {teamFeedback.message}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {selectedQuestionName ? (
                  <div className="space-y-4">
                    <button 
                      onClick={handleReset}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Back to all questions
                    </button>
                    <QuestionFeedbackDetail 
                      data={teamFeedback?.data} 
                      questionName={selectedQuestionName} 
                    />
                  </div>
                ) : (
                  <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-center">
                              {teamFeedback?.data?.team_size || 0}
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              Team Members
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-center">
                              {teamFeedback?.data?.response_count || 0}
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              Total Responses
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-center">
                              {teamFeedback?.data?.response_rate || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              Response Rate
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-lg font-medium mb-4">Campaign Details</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Campaign Name</div>
                              <div>{teamFeedback?.data?.campaign_info?.campaign_name}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Period</div>
                              <div>Period {teamFeedback?.data?.campaign_info?.period_number}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Start Date</div>
                              <div>{new Date(teamFeedback?.data?.campaign_info?.starts_at).toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">End Date</div>
                              <div>{new Date(teamFeedback?.data?.campaign_info?.ends_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="questions">
                      <QuestionFeedbackList 
                        questions={teamFeedback?.data?.questions || []} 
                        onQuestionSelect={handleQuestionSelect}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
