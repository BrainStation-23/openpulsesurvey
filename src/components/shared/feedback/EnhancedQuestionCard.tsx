
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';
import { ChartConfig } from '@/components/ui/chart';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import { RatingBarChart } from './charts/RatingBarChart';
import { BooleanPieChart } from './charts/BooleanPieChart';
import { TextResponseSummary } from './charts/TextResponseSummary';
import { QuestionInsight } from './QuestionInsight';
import { QuestionHeader } from './QuestionHeader';
import { ViewTextResponsesButton } from './ViewTextResponsesButton';

interface EnhancedQuestionCardProps {
  question: TeamFeedbackQuestion;
}

export function EnhancedQuestionCard({ question }: EnhancedQuestionCardProps) {
  const analytics = useFeedbackAnalytics();
  
  // Chart configuration for styling
  const chartConfig: ChartConfig = {
    'rating': {
      color: '#8B5CF6'
    },
    'boolean-yes': {
      color: '#10B981',
      label: 'Yes'
    },
    'boolean-no': {
      color: '#EF4444',
      label: 'No'
    }
  };

  const renderContent = () => {
    if (question.question_type === 'rating') {
      // Check if we have distribution data to render the chart
      if (question.distribution && Array.isArray(question.distribution)) {
        return (
          <div className="w-full bg-slate-50/50 rounded-lg p-6 mb-6">
            <div className="min-h-[280px] w-full">
              <RatingBarChart distribution={question.distribution} chartConfig={chartConfig} />
            </div>
          </div>
        );
      }
      
      // Fallback to simple stats display if no distribution data
      return (
        <div className="mt-4 p-6 bg-slate-50 rounded-md mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Average Rating</span>
            <span className="text-xl font-bold text-primary">
              {question.avg_value !== null ? question.avg_value.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Response Count</span>
            <span className="text-lg font-semibold">{question.response_count}</span>
          </div>
        </div>
      );
    }
    
    if (question.question_type === 'boolean' && question.distribution) {
      const trueCount = question.distribution.true_count || 0;
      const falseCount = question.distribution.false_count || 0;
      
      return (
        <div className="w-full bg-slate-50/50 rounded-lg p-6 mb-6">
          <div className="min-h-[280px] w-full">
            <BooleanPieChart trueCount={trueCount} falseCount={falseCount} chartConfig={chartConfig} />
          </div>
        </div>
      );
    }
    
    if (question.question_type === 'text' && question.distribution) {
      return (
        <div className="w-full bg-slate-50/50 rounded-lg p-6 mb-6">
          <TextResponseSummary distribution={question.distribution} />
        </div>
      );
    }
    
    return (
      <div className="p-6 text-center text-slate-500 mb-6">
        No response data available
      </div>
    );
  };

  const handleViewTextResponses = () => {
    analytics.logEvent('view_text_responses', {
      question_id: question.question_name
    });
    // In a real implementation, this would open a modal or navigate to a page with text responses
  };

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="border-b border-slate-100 pb-4">
        <QuestionHeader question={question} />
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6">
          {renderContent()}
        </div>
        
        {/* Show insights for both rating and boolean types */}
        {(question.question_type === 'rating' || question.question_type === 'boolean') && 
          question.avg_value !== null && (
            <div className="px-6 pb-4 border-t border-slate-100">
              <div className="pt-4">
                <QuestionInsight 
                  avgValue={question.avg_value} 
                  questionType={question.question_type} 
                />
              </div>
            </div>
        )}

        {/* Add button to view text responses for text questions */}
        {question.question_type === 'text' && 
          question.distribution && 
          question.distribution.length > 0 && (
            <div className="px-6 pb-6 border-t border-slate-100">
              <div className="pt-4">
                <ViewTextResponsesButton 
                  questionTitle={question.question_title}
                  responsesCount={question.distribution.length}
                  onClick={handleViewTextResponses}
                />
              </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
