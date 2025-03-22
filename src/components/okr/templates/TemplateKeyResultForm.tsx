
import React from 'react';
import { TemplateKeyResult } from '@/types/okr';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateKeyResultFormProps {
  keyResult: TemplateKeyResult;
  onChange: (keyResult: TemplateKeyResult) => void;
  onDelete: () => void;
}

export const TemplateKeyResultForm: React.FC<TemplateKeyResultFormProps> = ({ 
  keyResult, 
  onChange, 
  onDelete 
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...keyResult,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...keyResult,
      description: e.target.value
    });
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'numeric' | 'percentage' | 'currency' | 'boolean';
    const updatedKeyResult = { 
      ...keyResult,
      measurement_type: newType 
    };
    
    // Reset values for boolean type
    if (newType === 'boolean') {
      updatedKeyResult.start_value = 0;
      updatedKeyResult.target_value = 1;
    }
    
    onChange(updatedKeyResult);
  };

  const handleStartValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...keyResult,
      start_value: parseFloat(e.target.value) || 0
    });
  };

  const handleTargetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...keyResult,
      target_value: parseFloat(e.target.value) || 0
    });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...keyResult,
      weight: parseFloat(e.target.value) || 1
    });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor={`kr-title-${keyResult.id || 'new'}`}>Title</Label>
            <Input 
              id={`kr-title-${keyResult.id || 'new'}`}
              value={keyResult.title} 
              onChange={handleTitleChange} 
              placeholder="Enter key result title"
            />
          </div>
          <div>
            <Label htmlFor={`kr-desc-${keyResult.id || 'new'}`}>Description</Label>
            <Textarea 
              id={`kr-desc-${keyResult.id || 'new'}`}
              value={keyResult.description || ''} 
              onChange={handleDescriptionChange} 
              placeholder="Enter key result description"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`kr-type-${keyResult.id || 'new'}`}>Measurement Type</Label>
            <Select 
              value={keyResult.measurement_type} 
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id={`kr-type-${keyResult.id || 'new'}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="boolean">Yes/No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`kr-weight-${keyResult.id || 'new'}`}>Weight</Label>
            <Input 
              id={`kr-weight-${keyResult.id || 'new'}`}
              type="number" 
              value={keyResult.weight} 
              onChange={handleWeightChange} 
              min="1"
              max="10"
              step="1"
            />
          </div>
        </div>
        
        {keyResult.measurement_type !== 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`kr-start-${keyResult.id || 'new'}`}>Start Value</Label>
              <Input 
                id={`kr-start-${keyResult.id || 'new'}`}
                type="number" 
                value={keyResult.start_value} 
                onChange={handleStartValueChange} 
              />
            </div>
            <div>
              <Label htmlFor={`kr-target-${keyResult.id || 'new'}`}>Target Value</Label>
              <Input 
                id={`kr-target-${keyResult.id || 'new'}`}
                type="number" 
                value={keyResult.target_value} 
                onChange={handleTargetValueChange} 
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={onDelete} 
            variant="outline" 
            size="sm"
          >
            <Trash2 className="mr-1 h-4 w-4" /> Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
