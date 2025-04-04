
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BooleanQuestion } from '@/types/survey-builder';

interface BooleanPropertiesProps {
  question: BooleanQuestion;
  onUpdate: (updates: Partial<BooleanQuestion>) => void;
}

export const BooleanProperties: React.FC<BooleanPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Boolean Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="label-true">True Label</Label>
        <Input
          id="label-true"
          value={question.labelTrue || 'Yes'}
          onChange={(e) => onUpdate({ labelTrue: e.target.value })}
          placeholder="Label for true value"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="label-false">False Label</Label>
        <Input
          id="label-false"
          value={question.labelFalse || 'No'}
          onChange={(e) => onUpdate({ labelFalse: e.target.value })}
          placeholder="Label for false value"
        />
      </div>
    </div>
  );
};
