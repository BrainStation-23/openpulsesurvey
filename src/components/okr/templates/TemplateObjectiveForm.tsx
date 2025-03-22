
import React, { useState } from 'react';
import { TemplateObjective, TemplateKeyResult } from '@/types/okr';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from 'lucide-react';
import { TemplateKeyResultForm } from './TemplateKeyResultForm';

interface TemplateObjectiveFormProps {
  objective: TemplateObjective;
  onChange: (objective: TemplateObjective) => void;
  onDelete: () => void;
}

export const TemplateObjectiveForm: React.FC<TemplateObjectiveFormProps> = ({ 
  objective, 
  onChange, 
  onDelete 
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...objective,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...objective,
      description: e.target.value
    });
  };

  const addKeyResult = () => {
    const newKeyResult: TemplateKeyResult = {
      title: "New Key Result",
      description: "",
      measurement_type: "numeric",
      start_value: 0,
      target_value: 100,
      weight: 1
    };

    onChange({
      ...objective,
      key_results: [...(objective.key_results || []), newKeyResult]
    });
  };

  const updateKeyResult = (index: number, updatedKR: TemplateKeyResult) => {
    const updatedKeyResults = [...(objective.key_results || [])];
    updatedKeyResults[index] = updatedKR;
    
    onChange({
      ...objective,
      key_results: updatedKeyResults
    });
  };

  const removeKeyResult = (index: number) => {
    const updatedKeyResults = [...(objective.key_results || [])];
    updatedKeyResults.splice(index, 1);
    
    onChange({
      ...objective,
      key_results: updatedKeyResults
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Objective Title</Label>
          <Input 
            id="title" 
            value={objective.title} 
            onChange={handleTitleChange} 
            placeholder="Enter objective title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={objective.description || ''} 
            onChange={handleDescriptionChange} 
            placeholder="Enter objective description"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Key Results</h4>
          <Button 
            onClick={addKeyResult} 
            variant="outline" 
            size="sm"
          >
            <PlusCircle className="mr-1 h-4 w-4" /> Add Key Result
          </Button>
        </div>
        
        {(objective.key_results || []).length > 0 ? (
          <div className="space-y-3">
            {(objective.key_results || []).map((keyResult, index) => (
              <TemplateKeyResultForm
                key={index}
                keyResult={keyResult}
                onChange={(updated) => updateKeyResult(index, updated)}
                onDelete={() => removeKeyResult(index)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              <p className="mb-2">No key results added yet</p>
              <Button 
                onClick={addKeyResult} 
                variant="outline" 
                size="sm"
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Add Key Result
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onDelete} 
          variant="destructive" 
          size="sm"
        >
          <Trash2 className="mr-1 h-4 w-4" /> Delete Objective
        </Button>
      </div>
    </div>
  );
};
