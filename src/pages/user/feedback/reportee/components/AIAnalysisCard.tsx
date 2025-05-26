
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAIFeedbackAnalysis } from '@/hooks/useAIFeedbackAnalysis';
import { Brain, RefreshCw, Users, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisCardProps {
  campaignId?: string;
  instanceId?: string;
}

export function AIAnalysisCard({ campaignId, instanceId }: AIAnalysisCardProps) {
  const { generateAnalysis, clearAnalysis, isLoading, analysis, metadata } = useAIFeedbackAnalysis();

  const handleGenerate = () => {
    generateAnalysis(campaignId, instanceId);
  };

  const handleRegenerate = () => {
    clearAnalysis();
    generateAnalysis(campaignId, instanceId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Feedback Analysis</CardTitle>
          </div>
          {analysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !isLoading && (
          <div className="text-center py-8">
            <div className="rounded-full bg-primary/10 p-6 mx-auto mb-4 w-fit">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Get AI-Powered Insights</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Generate personalized feedback analysis and actionable recommendations 
              based on your team's responses.
            </p>
            <Button onClick={handleGenerate} disabled={!campaignId}>
              <Brain className="h-4 w-4 mr-2" />
              Generate Analysis
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">
              Analyzing your team feedback data...
            </p>
          </div>
        )}

        {analysis && metadata && (
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
      </CardContent>
    </Card>
  );
}
