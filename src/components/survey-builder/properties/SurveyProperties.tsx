
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SurveyStructure } from '@/types/survey-builder';

interface SurveyPropertiesProps {
  survey: SurveyStructure;
  onUpdate: (updates: Partial<SurveyStructure>) => void;
}

export const SurveyProperties: React.FC<SurveyPropertiesProps> = ({
  survey,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="survey-title">Survey Title</Label>
        <Input
          id="survey-title"
          value={survey.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter survey title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="survey-description">Survey Description</Label>
        <Textarea
          id="survey-description"
          value={survey.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter survey description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo-url">Logo URL</Label>
        <Input
          id="logo-url"
          value={survey.logo || ''}
          onChange={(e) => onUpdate({ logo: e.target.value })}
          placeholder="Enter logo URL"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo-position">Logo Position</Label>
        <Select
          value={survey.logoPosition || 'right'}
          onValueChange={(value) => onUpdate({ logoPosition: value as 'left' | 'right' | 'none' })}
        >
          <SelectTrigger id="logo-position">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="show-progress"
          checked={survey.showProgressBar}
          onCheckedChange={(checked) => onUpdate({ showProgressBar: checked === true })}
        />
        <Label htmlFor="show-progress">Show Progress Bar</Label>
      </div>
    </div>
  );
};
