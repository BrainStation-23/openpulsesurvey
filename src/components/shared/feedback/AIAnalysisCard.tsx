
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAIFeedbackAnalysis } from '@/hooks/useAIFeedbackAnalysis';
import { Brain, Users, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisCardProps {
  campaignId?: string;
  instanceId?: string;
}

export function AIAnalysisCard({ campaignId, instanceId }: AIAnalysisCardProps) {
  const { 
    fetchExistingAnalysis, 
    clearAnalysis, 
    isLoading, 
    analysis, 
    metadata,
    userLoading
  } = useAIFeedbackAnalysis();

  // Effect to handle fetching when campaignId, instanceId, or user changes
  useEffect(() => {
    console.log('AIAnalysisCard effect triggered:', { 
      campaignId, 
      instanceId, 
      userLoading 
    });

    if (campaignId && instanceId) {
      if (!userLoading) {
        console.log('Conditions met, fetching analysis');
        fetchExistingAnalysis(campaignId, instanceId);
      } else {
        console.log('User still loading, waiting...');
      }
    } else {
      console.log('Missing campaignId or instanceId, clearing analysis');
      clearAnalysis();
    }
  }, [campaignId, instanceId, userLoading, fetchExistingAnalysis, clearAnalysis]);

  const shouldShowContent = campaignId && instanceId;

  if (!shouldShowContent) {
    console.log('Not showing content - missing campaign or instance');
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Feedback Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="rounded-full bg-muted p-6 mx-auto mb-4 w-fit">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select Campaign & Instance</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please select a campaign and instance above to view AI-powered feedback analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Feedback Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {(isLoading || userLoading) && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">
              {userLoading ? 'Loading user data...' : 'Loading analysis...'}
            </p>
          </div>
        )}

        {!isLoading && !userLoading && analysis && metadata && (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team Size: {metadata.team_size}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Response Rate: {metadata.response_rate}%
              </Badge>
              <Badge variant="outline">
                Generated: {new Date(metadata.generated_at).toLocaleDateString()}
              </Badge>
            </div>

            {/* Analysis Content */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-foreground">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {!isLoading && !userLoading && !analysis && (
          <div className="text-center py-8">
            <div className="rounded-full bg-muted p-6 mx-auto mb-4 w-fit">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There is not enough data for an AI analysis at this time. Feedback analysis will be generated automatically when sufficient data is available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
