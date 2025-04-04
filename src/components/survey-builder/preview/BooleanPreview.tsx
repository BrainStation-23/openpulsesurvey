
import React from 'react';
import { BooleanQuestion } from '@/types/survey-builder';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BooleanPreviewProps {
  question: BooleanQuestion;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export const BooleanPreview: React.FC<BooleanPreviewProps> = ({
  question,
  value,
  onChange
}) => {
  const labelTrue = question.labelTrue || 'Yes';
  const labelFalse = question.labelFalse || 'No';
  
  return (
    <RadioGroup
      value={value === undefined ? undefined : value.toString()}
      onValueChange={(val) => onChange(val === 'true')}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="true" id={`${question.id}-true`} />
        <Label htmlFor={`${question.id}-true`}>{labelTrue}</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id={`${question.id}-false`} />
        <Label htmlFor={`${question.id}-false`}>{labelFalse}</Label>
      </div>
    </RadioGroup>
  );
};
