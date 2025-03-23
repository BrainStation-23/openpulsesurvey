
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlignedObjectivesView } from './AlignedObjectivesView';
import { ObjectiveHierarchyView } from './ObjectiveHierarchyView';
import { CreateAlignmentDialog } from './CreateAlignmentDialog';
import { ObjectiveWithRelations } from '@/types/okr';
import { Plus } from 'lucide-react';

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Manage Alignments</h3>
        {canEdit && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            variant="outline" 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Create Alignment
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ObjectiveHierarchyView objective={objective} isAdmin={isAdmin} />
        <AlignedObjectivesView objectiveId={objective.id} isAdmin={isAdmin} />
      </div>

      <CreateAlignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        sourceObjectiveId={objective.id}
      />
    </div>
  );
};
