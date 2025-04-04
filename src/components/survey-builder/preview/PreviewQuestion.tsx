
import React from 'react';
import { Question } from '@/types/survey-builder';
import { RatingPreview } from './RatingPreview';
import { BooleanPreview } from './BooleanPreview';
import { TextPreview } from './TextPreview';

interface PreviewQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const PreviewQuestion: React.FC<PreviewQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="border p-4 rounded-md">
      <div className="mb-2">
        <span className="font-medium">{question.title}</span>
        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
      </div>
      
      {question.description && (
        <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
      )}
      
      {question.type === 'rating' && (
        <RatingPreview question={question} value={value} onChange={onChange} />
      )}
      
      {question.type === 'boolean' && (
        <BooleanPreview question={question} value={value} onChange={onChange} />
      )}
      
      {(question.type === 'text' || question.type === 'comment') && (
        <TextPreview question={question} value={value} onChange={onChange} />
      )}
    </div>
  );
};
