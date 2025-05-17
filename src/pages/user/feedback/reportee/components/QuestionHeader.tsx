
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';

interface QuestionHeaderProps {
  question: TeamFeedbackQuestion;
  expanded: boolean;
  toggleExpanded: (e: React.MouseEvent) => void;
}

export function QuestionHeader({ question, expanded, toggleExpanded }: QuestionHeaderProps) {
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
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={(e) => {
          e.stopPropagation();
          toggleExpanded(e);
        }}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
