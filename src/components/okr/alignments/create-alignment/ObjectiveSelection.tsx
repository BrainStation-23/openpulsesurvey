
import React from 'react';
import { Button } from "@/components/ui/button";
import { Objective, ObjectiveVisibility } from '@/types/okr';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SBUSelector } from '@/components/okr/permissions/SBUSelector';
import { ObjectiveVisibilityFilter } from './ObjectiveVisibilityFilter';
import { Input } from '@/components/ui/input';

interface ObjectiveSelectionProps {
  relationDirection: 'parent' | 'child';
  toggleRelationDirection: () => void;
  selectedObjective: Objective | null;
  setSelectedObjective: (objective: Objective | null) => void;
  sourceObjectiveId: string;
  visibilityFilter: ObjectiveVisibility | 'all';
  setVisibilityFilter: (visibility: ObjectiveVisibility | 'all') => void;
  permissions: any;
  isLoadingPermissions: boolean;
  selectedSbuId: string | null;
  setSelectedSbuId: (sbuId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  disableChildDirection?: boolean;
}

export const ObjectiveSelection: React.FC<ObjectiveSelectionProps> = ({
  relationDirection,
  toggleRelationDirection,
  selectedObjective,
  setSelectedObjective,
  sourceObjectiveId,
  visibilityFilter,
  setVisibilityFilter,
  permissions,
  isLoadingPermissions,
  selectedSbuId,
  setSelectedSbuId,
  searchQuery,
  setSearchQuery,
  disableChildDirection = false
}) => {
  const handleDirectionToggle = () => {
    if (!disableChildDirection) {
      toggleRelationDirection();
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Alignment Direction</h3>
        <div className="p-3 border rounded-md">
          <div className="flex items-center justify-between gap-2">
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Selected Objective</p>
              <div className="bg-muted rounded-md py-2 px-4">
                <p className="font-medium">Other Objective</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDirectionToggle}
              disabled={disableChildDirection && relationDirection === 'parent'}
              className={disableChildDirection ? 'cursor-not-allowed opacity-50' : ''}
            >
              {relationDirection === 'parent' ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
            
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Current Objective</p>
              <div className="bg-muted rounded-md py-2 px-4">
                <p className="font-medium">This Objective</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-sm font-medium">
              {relationDirection === 'parent' ? (
                <>This objective will be a <span className="text-primary font-semibold">child</span> of the selected objective</>
              ) : (
                <>This objective will be a <span className="text-primary font-semibold">parent</span> of the selected objective</>
              )}
            </p>
            {disableChildDirection && relationDirection === 'parent' && (
              <p className="text-xs text-muted-foreground mt-1">
                This objective has key results and can only be aligned as a child to other objectives.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Search</h3>
        <Input
          placeholder="Search objectives by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Filter by Visibility</h3>
        <ObjectiveVisibilityFilter
          value={visibilityFilter}
          onChange={setVisibilityFilter}
          permissions={permissions}
          isLoading={isLoadingPermissions}
        />
      </div>
      
      {visibilityFilter === 'department' && (
        <div>
          <h3 className="text-sm font-medium mb-2">Filter by Business Unit</h3>
          <SBUSelector
            selectedSBUs={selectedSbuId ? [selectedSbuId] : []}
            onChange={(sbus) => setSelectedSbuId(sbus.length > 0 ? sbus[0] : null)}
          />
        </div>
      )}
    </div>
  );
};
