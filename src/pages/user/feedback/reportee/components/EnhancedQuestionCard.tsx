
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
          <div className="chart-container bg-slate-50/50 rounded-lg p-4 mb-6">
            <RatingBarChart distribution={question.distribution} chartConfig={chartConfig} />
          </div>
        );
      }
      
      // Fallback to simple stats display if no distribution data
      return (
        <div className="mt-4 p-4 bg-slate-50 rounded-md mb-6">
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
        <div className="chart-container bg-slate-50/50 rounded-lg p-4 mb-6">
          <BooleanPieChart trueCount={trueCount} falseCount={falseCount} chartConfig={chartConfig} />
        </div>
      );
    }
    
    if (question.question_type === 'text' && question.distribution) {
      return (
        <div className="chart-container bg-slate-50/50 rounded-lg p-4 mb-6">
          <TextResponseSummary distribution={question.distribution} />
        </div>
      );
    }
    
    return (
      <div className="p-4 text-center text-slate-500 mb-6">
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
      <CardHeader className="border-b border-slate-100">
        <QuestionHeader question={question} />
      </CardHeader>
      
      <CardContent className="pt-6">
        {renderContent()}
        
        {/* Show insights for both rating and boolean types */}
        {(question.question_type === 'rating' || question.question_type === 'boolean') && 
          question.avg_value !== null && (
            <div className="insight-container border-t border-slate-100 pt-4 mt-2">
              <QuestionInsight 
                avgValue={question.avg_value} 
                questionType={question.question_type} 
              />
            </div>
        )}

        {/* Add button to view text responses for text questions */}
        {question.question_type === 'text' && 
          question.distribution && 
          question.distribution.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <ViewTextResponsesButton 
                questionTitle={question.question_title}
                responsesCount={question.distribution.length}
                onClick={handleViewTextResponses}
              />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
