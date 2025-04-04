
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/survey-builder';
import { Separator } from '@/components/ui/separator';

interface CommonPropertiesProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export const CommonProperties: React.FC<CommonPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Base Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="question-title">Question Title</Label>
        <Input
          id="question-title"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter question title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="question-description">Description (optional)</Label>
        <Textarea
          id="question-description"
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter additional description or instructions"
          rows={2}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-required"
          checked={question.isRequired}
          onCheckedChange={(checked) => onUpdate({ isRequired: checked === true })}
        />
        <Label htmlFor="is-required">Required question</Label>
      </div>
      
      <Separator className="my-2" />
    </div>
  );
};
