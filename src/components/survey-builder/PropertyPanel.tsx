
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Question, SurveyStructure } from '@/types/survey-builder';
import { QuestionProperties } from './properties/QuestionProperties';
import { SurveyProperties } from './properties/SurveyProperties';

interface PropertyPanelProps {
  survey: SurveyStructure;
  selectedQuestion: Question | null;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onUpdateSurvey: (updates: Partial<SurveyStructure>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  survey,
  selectedQuestion,
  onUpdateQuestion,
  onUpdateSurvey
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Properties</CardTitle>
        <CardDescription>
          {selectedQuestion 
            ? 'Customize the selected question' 
            : 'Customize survey settings'}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[700px]">
        {selectedQuestion ? (
          <QuestionProperties 
            question={selectedQuestion}
            onUpdate={(updates) => onUpdateQuestion(selectedQuestion.id, updates)}
          />
        ) : (
          <SurveyProperties survey={survey} onUpdate={onUpdateSurvey} />
        )}
      </CardContent>
    </Card>
  );
};
