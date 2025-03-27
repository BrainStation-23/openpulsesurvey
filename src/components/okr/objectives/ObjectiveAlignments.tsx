
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ObjectiveProgress } from './ObjectiveProgress';
import { ObjectiveVisibilityBadge } from './ObjectiveVisibilityBadge';
import { useObjectiveAlignments } from '@/hooks/okr/useObjectiveAlignments';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ObjectiveAlignmentsProps {
  objectiveId: string;
  onCreateAlignment?: () => void;
}

export const ObjectiveAlignments: React.FC<ObjectiveAlignmentsProps> = ({ 
  objectiveId,
  onCreateAlignment
}) => {
  const { 
    alignmentsFrom, 
    alignmentsTo, 
    isLoading
  } = useObjectiveAlignments(objectiveId);

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
        {onCreateAlignment && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={onCreateAlignment}
          >
            <Plus className="h-4 w-4" />
            Create Alignment
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Alignments From This Objective */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              This objective contributes to
            </CardTitle>
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
};
