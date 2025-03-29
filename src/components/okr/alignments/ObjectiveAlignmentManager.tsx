
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ObjectiveGraphView } from './ObjectiveGraphView';
import { CreateAlignmentDialog } from './CreateAlignmentDialog';
import { ObjectiveWithRelations } from '@/types/okr';
import { Plus } from 'lucide-react';
import './styles/ObjectiveFlowStyles.css';

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
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleAlignmentChange = useCallback(() => {
    // Increment the counter to force a refresh
    setRefreshCounter(prev => prev + 1);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateDialogOpen(false);
    handleAlignmentChange();
  }, [handleAlignmentChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Objective Hierarchy</h3>
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
      
      <ObjectiveGraphView 
        objective={objective} 
        isAdmin={isAdmin} 
        canEdit={canEdit}
        onAlignmentChange={handleAlignmentChange}
        key={`objective-graph-${refreshCounter}`} // Add key for forced refresh
      />
      
      <CreateAlignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        sourceObjectiveId={objective.id}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
