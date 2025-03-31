
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowUp, ArrowDown, LockIcon } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSBUs } from '@/hooks/okr/useSBUs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';

interface ObjectiveSelectionProps {
  relationDirection: 'parent' | 'child';
  toggleRelationDirection: () => void;
  selectedObjective: Objective | null;
  setSelectedObjective: (objective: Objective | null) => void;
  sourceObjectiveId: string;
  visibilityFilter: ObjectiveVisibility | 'all';
  setVisibilityFilter: (filter: ObjectiveVisibility | 'all') => void;
  permissions: {
    organization: boolean;
    department: boolean;
    team: boolean;
    private: boolean;
    hasAnyPermission: boolean;
  };
  isLoadingPermissions: boolean;
}

export const ObjectiveSelection = ({
  relationDirection,
  toggleRelationDirection,
  selectedObjective,
  setSelectedObjective,
  sourceObjectiveId,
  visibilityFilter,
  setVisibilityFilter,
  permissions,
  isLoadingPermissions
}: ObjectiveSelectionProps) => {
  const { sbus, isLoading: sbusLoading } = useSBUs();
  const { user } = useCurrentUser();
  const [selectedSbuId, setSelectedSbuId] = React.useState<string | null>(null);
  const [userSbuId, setUserSbuId] = React.useState<string | null>(null);
  
  // Fetch the user's primary SBU when component mounts
  useEffect(() => {
    const fetchUserSbu = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_sbus')
          .select('sbu_id')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();
        
        if (data?.sbu_id) {
          setUserSbuId(data.sbu_id);
          setSelectedSbuId(data.sbu_id);
        }
      }
    };
    
    fetchUserSbu();
  }, [user]);
  
  const handleSelectObjective = (objective: Objective) => {
    setSelectedObjective(objective);
  };

  // Reset SBU filter when visibility changes
  useEffect(() => {
    if (visibilityFilter === 'department' && userSbuId) {
      setSelectedSbuId(userSbuId);
    }
  }, [visibilityFilter, userSbuId]);

  // If user doesn't have permission to view any type of objective, default to "all"
  // to avoid empty selection
  useEffect(() => {
    if (!isLoadingPermissions && !permissions.hasAnyPermission) {
      setVisibilityFilter('all');
    }
  }, [permissions.hasAnyPermission, isLoadingPermissions, setVisibilityFilter]);

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
              
              <SelectItem 
                value="organization" 
                disabled={!permissions.organization}
              >
                <div className="flex items-center">
                  <span>Organization</span>
                  {!permissions.organization && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You don't have permission to align with organization objectives</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </SelectItem>
              
              <SelectItem 
                value="department" 
                disabled={!permissions.department}
              >
                <div className="flex items-center">
                  <span>Department</span>
                  {!permissions.department && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You don't have permission to align with department objectives</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </SelectItem>
              
              <SelectItem 
                value="team" 
                disabled={!permissions.team}
              >
                <div className="flex items-center">
                  <span>Team</span>
                  {!permissions.team && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You don't have permission to align with team objectives</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </SelectItem>
              
              <SelectItem 
                value="private" 
                disabled={!permissions.private}
              >
                <div className="flex items-center">
                  <span>Private</span>
                  {!permissions.private && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You don't have permission to align with private objectives</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show SBU filter only when department visibility is selected */}
        {visibilityFilter === 'department' && (
          <div className="space-y-2">
            <Label>Filter by Department (SBU)</Label>
            <Select 
              value={selectedSbuId || ''}
              onValueChange={(value) => setSelectedSbuId(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {sbusLoading ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : (
                  sbus?.map(sbu => (
                    <SelectItem key={sbu.id} value={sbu.id}>
                      {sbu.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}
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
          permissions={permissions}
          selectedSbuId={visibilityFilter === 'department' ? selectedSbuId : undefined}
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
