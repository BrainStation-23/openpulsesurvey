
import React from 'react';
import { Question } from '@/types/survey-builder';
import { CommonProperties } from './CommonProperties';
import { RatingProperties } from './RatingProperties';
import { BooleanProperties } from './BooleanProperties';
import { TextProperties } from './TextProperties';
import { CommentProperties } from './CommentProperties';

interface QuestionPropertiesProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export const QuestionProperties: React.FC<QuestionPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-6">
      <CommonProperties question={question} onUpdate={onUpdate} />
      
      {question.type === 'rating' && (
        <RatingProperties question={question} onUpdate={onUpdate} />
      )}
      
      {question.type === 'boolean' && (
        <BooleanProperties question={question} onUpdate={onUpdate} />
      )}
      
      {question.type === 'text' && (
        <TextProperties question={question} onUpdate={onUpdate} />
      )}
      
      {question.type === 'comment' && (
        <CommentProperties question={question} onUpdate={onUpdate} />
      )}
    </div>
  );
};
