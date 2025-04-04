
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextQuestion } from '@/types/survey-builder';

interface TextPropertiesProps {
  question: TextQuestion;
  onUpdate: (updates: Partial<TextQuestion>) => void;
}

export const TextProperties: React.FC<TextPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Text Properties</h3>
      
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
        <Label htmlFor="max-length">Maximum Length</Label>
        <Input
          id="max-length"
          type="number"
          value={question.maxLength || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            onUpdate({ maxLength: value });
          }}
          placeholder="Enter maximum character length"
          min={1}
        />
      </div>
    </div>
  );
};
