
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RatingQuestion } from '@/types/survey-builder';

interface RatingPropertiesProps {
  question: RatingQuestion;
  onUpdate: (updates: Partial<RatingQuestion>) => void;
}

export const RatingProperties: React.FC<RatingPropertiesProps> = ({
  question,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Rating Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="rate-type">Rating Type</Label>
        <Select
          value={question.rateType || 'stars'}
          onValueChange={(value) => onUpdate({ rateType: value as 'stars' | 'smileys' | 'numbers' })}
        >
          <SelectTrigger id="rate-type">
            <SelectValue placeholder="Select rating type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="smileys">Smileys</SelectItem>
            <SelectItem value="numbers">Numbers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rate-min">Minimum Value</Label>
          <Input
            id="rate-min"
            type="number"
            value={question.rateMin || 1}
            onChange={(e) => onUpdate({ rateMin: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rate-max">Maximum Value</Label>
          <Input
            id="rate-max"
            type="number"
            value={question.rateMax || 5}
            onChange={(e) => onUpdate({ rateMax: parseInt(e.target.value) || 5 })}
            min={1}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rate-step">Step Size</Label>
        <Input
          id="rate-step"
          type="number"
          value={question.rateStep || 1}
          onChange={(e) => onUpdate({ rateStep: parseFloat(e.target.value) || 1 })}
          min={0.1}
          step={0.1}
        />
      </div>
    </div>
  );
};
