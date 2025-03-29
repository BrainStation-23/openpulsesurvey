
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Objective } from '@/types/okr';
import { ObjectiveSearchInput } from '../ObjectiveSearchInput';

interface ObjectiveSelectionProps {
  relationDirection: 'parent' | 'child';
  toggleRelationDirection: () => void;
  selectedObjective: Objective | null;
  setSelectedObjective: (objective: Objective | null) => void;
  sourceObjectiveId: string;
}

export const ObjectiveSelection = ({
  relationDirection,
  toggleRelationDirection,
  selectedObjective,
  setSelectedObjective,
  sourceObjectiveId
}: ObjectiveSelectionProps) => {
  
  const handleSelectObjective = (objective: Objective) => {
    setSelectedObjective(objective);
  };

  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          {relationDirection === 'parent' 
            ? "The selected objective will be the parent of your current objective."
            : "Your current objective will be the parent of the selected objective."
          }
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Relationship Direction:</span>
        <Button 
          type="button" 
          variant="outline" 
          onClick={toggleRelationDirection}
        >
          {relationDirection === 'parent' 
            ? "Selected objective is parent" 
            : "Selected objective is child"
          }
        </Button>
      </div>
      
      {selectedObjective && (
        <div className="bg-accent/50 p-3 rounded-md">
          <p className="text-sm font-medium">Selected objective:</p>
          <p className="text-base">{selectedObjective.title}</p>
          {selectedObjective.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {selectedObjective.description}
            </p>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2" 
            onClick={() => setSelectedObjective(null)}
          >
            Clear selection
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Select an objective:</label>
        <ObjectiveSearchInput 
          currentObjectiveId={sourceObjectiveId}
          onSelect={handleSelectObjective}
          placeholder="Search for objectives..."
        />
      </div>
    </div>
  );
};
