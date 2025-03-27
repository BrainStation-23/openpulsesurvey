
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';
import { ObjectiveVisibility } from '@/types/okr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useObjectiveAlignments } from '@/hooks/okr/useObjectiveAlignments';
import { useObjective } from '@/hooks/okr/useObjective';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ObjectiveAlignmentsProps {
  objectiveId: string;
}

export const ObjectiveAlignments: React.FC<ObjectiveAlignmentsProps> = ({ objectiveId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { objective } = useObjective(objectiveId);
  const { 
    canCreateAlignments, 
    canAlignWithVisibility, 
    isObjectiveOwner, 
    isLoading: permissionsLoading 
  } = useOkrPermissions();
  
  const { 
    alignedObjectives, 
    parentObjectives, 
    isLoading,
    error 
  } = useObjectiveAlignments(objectiveId);
  
  const [isOwner, setIsOwner] = useState(false);

  // Check if current user is the owner of this objective
  React.useEffect(() => {
    const checkOwnership = async () => {
      if (objectiveId) {
        const result = await isObjectiveOwner(objectiveId);
        setIsOwner(result);
      }
    };
    
    checkOwnership();
  }, [objectiveId, isObjectiveOwner]);

  // Determine if the user can create alignments
  const canCreate = canCreateAlignments || isOwner;
  
  if (isLoading || permissionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load alignments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {objective && canCreate && (
        <div className="flex justify-end">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Alignment
          </Button>
        </div>
      )}

      {/* Parent objectives section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Aligned With</h3>
        {parentObjectives && parentObjectives.length > 0 ? (
          <div className="space-y-2">
            {parentObjectives.map(parent => (
              <Card key={parent.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{parent.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {parent.visibility}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Not aligned with any parent objectives
          </div>
        )}
      </div>

      {/* Child objectives section */}
      <div className="space-y-3 mt-6">
        <h3 className="text-sm font-medium">Child Objectives</h3>
        {alignedObjectives && alignedObjectives.length > 0 ? (
          <div className="space-y-2">
            {alignedObjectives.map(child => (
              <Card key={child.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{child.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {child.visibility}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No child objectives aligned with this one
          </div>
        )}
      </div>

      {/* Add alignment dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Alignment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Alignment Permissions</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  <li className={canAlignWithVisibility('organization') ? 'text-green-600' : 'text-red-600'}>
                    {canAlignWithVisibility('organization') 
                      ? 'You can align with Organization-level objectives' 
                      : 'You cannot align with Organization-level objectives'}
                  </li>
                  <li className={canAlignWithVisibility('department') ? 'text-green-600' : 'text-red-600'}>
                    {canAlignWithVisibility('department') 
                      ? 'You can align with Department-level objectives' 
                      : 'You cannot align with Department-level objectives'}
                  </li>
                  <li className={canAlignWithVisibility('team') ? 'text-green-600' : 'text-red-600'}>
                    {canAlignWithVisibility('team') 
                      ? 'You can align with Team-level objectives' 
                      : 'You cannot align with Team-level objectives'}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
            
            {/* TODO: Implement the alignment selector */}
            <div className="text-center text-muted-foreground">
              Alignment selector would go here.
              <br />
              <small className="text-xs">This component is not fully implemented yet.</small>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for the arrow icon
const ArrowUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="m18 15-6-6-6 6"/>
  </svg>
);
