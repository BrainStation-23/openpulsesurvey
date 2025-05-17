
import React, { useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);
  const analytics = useFeedbackAnalytics();
  
  const toggleExpanded = (e: React.MouseEvent) => {
    setExpanded(!expanded);
    
    // Log user interaction
    analytics.logEvent('toggle_question_card', { 
      question_id: question.question_name,
      question_type: question.question_type,
      expanded: !expanded
    });
  };

  // Chart configuration for styling - proper format to match ChartConfig type
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

  const renderChart = () => {
    if (question.question_type === 'rating' && question.distribution && Array.isArray(question.distribution)) {
      return <RatingBarChart distribution={question.distribution} chartConfig={chartConfig} />;
    }
    
    if (question.question_type === 'boolean' && question.distribution) {
      const trueCount = question.distribution.true_count || 0;
      const falseCount = question.distribution.false_count || 0;
      
      return <BooleanPieChart trueCount={trueCount} falseCount={falseCount} chartConfig={chartConfig} />;
    }
    
    if (question.question_type === 'text' && question.distribution) {
      return <TextResponseSummary distribution={question.distribution} />;
    }
    
    return null;
  };

  const handleViewTextResponses = () => {
    analytics.logEvent('view_text_responses', {
      question_id: question.question_name
    });
    // In a real implementation, this would open a modal or navigate to a page with text responses
  };

  return (
    <Card 
      className={`w-full transition-all duration-200 hover:shadow-md ${expanded ? 'border-primary/50' : ''}`}
      onClick={toggleExpanded}
    >
      <CardHeader className="cursor-pointer">
        <QuestionHeader 
          question={question} 
          expanded={expanded} 
          toggleExpanded={toggleExpanded} 
        />
      </CardHeader>
      
      {expanded && (
        <CardContent>
          {renderChart()}
          
          {/* Show insights for both rating and boolean types */}
          {(question.question_type === 'rating' || question.question_type === 'boolean') && question.avg_value !== null && (
            <QuestionInsight avgValue={question.avg_value} />
          )}

          {/* Add button to view text responses for text questions */}
          {question.question_type === 'text' && question.distribution && question.distribution.length > 0 && (
            <ViewTextResponsesButton 
              questionTitle={question.question_title}
              responsesCount={question.distribution.length}
              onClick={handleViewTextResponses}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
