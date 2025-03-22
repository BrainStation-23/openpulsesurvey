
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlignedObjectivesView } from './AlignedObjectivesView';
import { ObjectiveHierarchyView } from './ObjectiveHierarchyView';
import { CreateAlignmentDialog } from './CreateAlignmentDialog';
import { ObjectiveWithRelations } from '@/types/okr';
import { Network, Plus } from 'lucide-react';

interface ObjectiveAlignmentManagerProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
  canEdit?: boolean;
}

export const ObjectiveAlignmentManager: React.FC<ObjectiveAlignmentManagerProps> = ({
  objective,
  isAdmin = false,
  canEdit = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div className="flex items-center">
            <Network className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-xl">Objective Alignments</CardTitle>
          </div>
          {canEdit && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              variant="outline" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Create Alignment
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <ObjectiveHierarchyView objective={objective} isAdmin={isAdmin} />
            <AlignedObjectivesView objectiveId={objective.id} isAdmin={isAdmin} />
          </div>
        </CardContent>
      </Card>

      <CreateAlignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        sourceObjectiveId={objective.id}
      />
    </div>
  );
};
