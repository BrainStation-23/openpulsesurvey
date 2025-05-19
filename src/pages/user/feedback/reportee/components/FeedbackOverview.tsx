
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, PieChart, TrendingUp } from 'lucide-react';
import { TeamFeedbackData } from '@/hooks/useReporteeFeedback';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';

interface FeedbackOverviewProps {
  data: TeamFeedbackData;
  isLoading: boolean;
}

export function FeedbackOverview({ data, isLoading }: FeedbackOverviewProps) {
  const analytics = useFeedbackAnalytics();
  
  // Log view event when component mounts
  React.useEffect(() => {
    analytics.logEvent('view_feedback_overview', {
      team_size: data?.team_size || 0,
      response_count: data?.response_count || 0
    });
  }, [data, analytics]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { team_size = 0, response_count = 0, response_rate = 0 } = data;

  // Calculate total items in the feedback questionnaire
  const totalQuestions = data.questions?.length || 0;
  
  // Get period information if available
  const periodLabel = data.campaign_info 
    ? `Period ${data.campaign_info.period_number}` 
    : 'Current Period';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-row items-center justify-between h-full">
          <div>
            <p className="text-sm text-muted-foreground">Team Size</p>
            <p className="text-3xl font-bold">{team_size}</p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-row items-center justify-between h-full">
          <div>
            <p className="text-sm text-muted-foreground">Responses</p>
            <p className="text-3xl font-bold">{response_count}</p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-row items-center justify-between h-full">
          <div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-3xl font-bold">{response_rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <PieChart className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-row items-center justify-between h-full">
          <div>
            <p className="text-sm text-muted-foreground">Questions</p>
            <p className="text-3xl font-bold">{totalQuestions}</p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
