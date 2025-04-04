
import React from 'react';
import { TextQuestion, CommentQuestion } from '@/types/survey-builder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TextPreviewProps {
  question: TextQuestion | CommentQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const TextPreview: React.FC<TextPreviewProps> = ({
  question,
  value,
  onChange
}) => {
  const placeholder = question.placeholder || 'Enter your answer here...';
  
  if (question.type === 'comment') {
    const rows = (question as CommentQuestion).rows || 3;
    
    return (
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    );
  }
  
  // For text questions
  const maxLength = (question as TextQuestion).maxLength;
  
  return (
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
};
