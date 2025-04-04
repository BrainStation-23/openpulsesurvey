
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CommentQuestion } from '@/types/survey-builder';

interface CommentPropertiesProps {
  question: CommentQuestion;
  onUpdate: (updates: Partial<CommentQuestion>) => void;
}

export const CommentProperties: React.FC<CommentPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Comment Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="placeholder">Placeholder</Label>
        <Input
          id="placeholder"
          value={question.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Enter placeholder text"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rows">Number of Rows</Label>
        <Input
          id="rows"
          type="number"
          value={question.rows || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            onUpdate({ rows: value });
          }}
          placeholder="Enter number of rows"
          min={1}
        />
      </div>
    </div>
  );
};
