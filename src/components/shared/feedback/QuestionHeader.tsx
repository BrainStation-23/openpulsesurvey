
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';

interface QuestionHeaderProps {
  question: TeamFeedbackQuestion;
}

export function QuestionHeader({ question }: QuestionHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-lg font-medium flex items-center">
          {question.question_title}
          {question.question_type === 'rating' && question.avg_value !== null && (
            <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
              Avg: {question.avg_value.toFixed(1)}
            </Badge>
          )}
          {question.question_type === 'boolean' && question.avg_value !== null && (
            <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
              Yes: {(question.avg_value * 100).toFixed(0)}%
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="mt-1 flex items-center">
          <Badge
            variant="outline"
            className={
              question.question_type === 'rating'
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : question.question_type === 'boolean'
                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }
          >
            {question.question_type}
          </Badge>
          <span className="ml-2 text-sm text-muted-foreground">
            {question.response_count} responses
          </span>
        </CardDescription>
      </div>
    </div>
  );
}
