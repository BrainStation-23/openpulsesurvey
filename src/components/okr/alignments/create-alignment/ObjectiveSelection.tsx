
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Objective, ObjectiveVisibility } from '@/types/okr';
import { ObjectiveSearchInput } from '../ObjectiveSearchInput';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ObjectiveSelectionProps {
  relationDirection: 'parent' | 'child';
  toggleRelationDirection: () => void;
  selectedObjective: Objective | null;
  setSelectedObjective: (objective: Objective | null) => void;
  sourceObjectiveId: string;
  visibilityFilter: ObjectiveVisibility | 'all';
  setVisibilityFilter: (filter: ObjectiveVisibility | 'all') => void;
}

export const ObjectiveSelection = ({
  relationDirection,
  toggleRelationDirection,
  selectedObjective,
  setSelectedObjective,
  sourceObjectiveId,
  visibilityFilter,
  setVisibilityFilter
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
      
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <Label>Relationship Direction</Label>
          <Button 
            type="button" 
            variant="outline" 
            onClick={toggleRelationDirection}
            className="w-full flex justify-between items-center"
          >
            {relationDirection === 'parent' 
              ? (
                <>
                  <span>Selected objective is parent</span>
                  <ArrowUp className="h-4 w-4 ml-2" />
                </>
              )
              : (
                <>
                  <span>Selected objective is child</span>
                  <ArrowDown className="h-4 w-4 ml-2" />
                </>
              )
            }
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>Filter by visibility</Label>
          <Select 
            value={visibilityFilter} 
            onValueChange={(value) => setVisibilityFilter(value as ObjectiveVisibility | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Objectives</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedObjective && (
        <div className={`p-4 rounded-md border ${getVisibilityColorClass(selectedObjective.visibility)}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Selected Objective</h4>
              <p className="text-base font-semibold">{selectedObjective.title}</p>
              {selectedObjective.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedObjective.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  {getVisibilityLabel(selectedObjective.visibility)}
                </div>
                {selectedObjective.sbuId && (
                  <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                    SBU: {selectedObjective.sbuId}
                  </div>
                )}
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                  Progress: {selectedObjective.progress}%
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-2" 
              onClick={() => setSelectedObjective(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Select an objective:</Label>
        <ObjectiveSearchInput 
          currentObjectiveId={sourceObjectiveId}
          onSelect={handleSelectObjective}
          placeholder="Search for objectives..."
          visibilityFilter={visibilityFilter}
        />
      </div>
    </div>
  );
};

// Helper function to get visibility label
const getVisibilityLabel = (visibility: ObjectiveVisibility): string => {
  switch (visibility) {
    case 'organization':
      return 'Organization';
    case 'department':
      return 'Department';
    case 'team':
      return 'Team';
    case 'private':
      return 'Private';
    default:
      return visibility;
  }
};

// Helper function to get color class based on visibility
const getVisibilityColorClass = (visibility: ObjectiveVisibility): string => {
  switch (visibility) {
    case 'organization':
      return 'bg-orange-50 border-orange-200';
    case 'department':
      return 'bg-purple-50 border-purple-200';
    case 'team':
      return 'bg-blue-50 border-blue-200';
    case 'private':
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};
