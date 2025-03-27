
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useObjectiveAlignments } from '@/hooks/okr/useObjectiveAlignments';
import { CreateAlignmentDialog } from './CreateAlignmentDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ObjectiveVisibilityBadge } from '@/components/okr/objectives/ObjectiveVisibilityBadge';
import { ObjectiveProgress } from '@/components/okr/objectives/ObjectiveProgress';

interface ObjectiveAlignmentManagerProps {
  objectiveId: string;
  isAdmin?: boolean;
  canEdit?: boolean;
}

export function ObjectiveAlignmentManager({ 
  objectiveId, 
  isAdmin = false, 
  canEdit = false 
}: ObjectiveAlignmentManagerProps) {
  const [isCreatingAlignment, setIsCreatingAlignment] = useState(false);
  const { 
    alignmentsFrom, 
    alignmentsTo, 
    isLoading, 
    refetch 
  } = useObjectiveAlignments(objectiveId);

  const handleAlignmentCreated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Objective Alignments</h3>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => setIsCreatingAlignment(true)}
        >
          <Plus className="h-4 w-4" />
          Create Alignment
        </Button>
      </div>

      <CreateAlignmentDialog 
        isOpen={isCreatingAlignment}
        onOpenChange={setIsCreatingAlignment}
        sourceObjectiveId={objectiveId}
        onSuccess={handleAlignmentCreated}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Alignments From This Objective */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              This objective contributes to
            </CardTitle>
            <CardDescription>
              Higher-level objectives that this objective supports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alignmentsFrom.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No alignments to other objectives
              </p>
            ) : (
              <div className="space-y-3">
                {alignmentsFrom.map((alignment) => (
                  <div key={alignment.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">
                          {alignment.alignedObjectiveTitle}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {alignment.alignmentType === 'contributes_to'
                            ? 'Contributes to'
                            : alignment.alignmentType === 'blocks'
                            ? 'Blocks'
                            : 'Related to'}
                        </div>
                        <div className="flex items-center gap-2">
                          <ObjectiveVisibilityBadge
                            visibility={alignment.alignedObjectiveVisibility}
                          />
                        </div>
                      </div>
                      <ObjectiveProgress
                        progress={alignment.alignedObjectiveProgress}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alignments To This Objective */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Objectives that contribute to this
            </CardTitle>
            <CardDescription>
              Lower-level objectives that support this objective
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alignmentsTo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No objectives align to this one
              </p>
            ) : (
              <div className="space-y-3">
                {alignmentsTo.map((alignment) => (
                  <div key={alignment.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">
                          {alignment.sourceObjectiveTitle}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {alignment.alignmentType === 'contributes_to'
                            ? 'Contributes to this'
                            : alignment.alignmentType === 'blocks'
                            ? 'Blocks this'
                            : 'Related to this'}
                        </div>
                        <div className="flex items-center gap-2">
                          <ObjectiveVisibilityBadge
                            visibility={alignment.sourceObjectiveVisibility}
                          />
                        </div>
                      </div>
                      <ObjectiveProgress
                        progress={alignment.sourceObjectiveProgress}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
