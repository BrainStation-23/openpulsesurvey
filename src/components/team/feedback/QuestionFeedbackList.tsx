
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart4, MessageSquare, ToggleLeft } from 'lucide-react';

interface QuestionStats {
  question_name: string;
  question_title: string;
  question_type: string;
  response_count: number;
  avg_value: number | null;
  distribution: any;
}

interface QuestionFeedbackListProps {
  questions: QuestionStats[];
  onQuestionSelect: (questionName: string) => void;
}

export const QuestionFeedbackList: React.FC<QuestionFeedbackListProps> = ({ questions, onQuestionSelect }) => {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card 
          key={question.question_name} 
          className="hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onQuestionSelect(question.question_name)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {question.question_type === 'rating' && <BarChart4 className="h-5 w-5 text-blue-500" />}
                {question.question_type === 'boolean' && <ToggleLeft className="h-5 w-5 text-green-500" />}
                {(question.question_type === 'text' || question.question_type === 'comment') && 
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                }
              </div>
              <div className="flex-1">
                <div className="font-medium">{question.question_title || question.question_name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {question.response_count} responses
                </div>
                
                {question.question_type === 'rating' && question.avg_value !== null && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">Average rating</div>
                    <div className="font-medium">{question.avg_value.toFixed(1)}</div>
                  </div>
                )}
                
                {question.question_type === 'boolean' && question.distribution && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Yes</div>
                      <div className="font-medium">{question.distribution.true_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">No</div>
                      <div className="font-medium">{question.distribution.false_count || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {questions.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No question data available for this survey.
        </div>
      )}
    </div>
  );
};
