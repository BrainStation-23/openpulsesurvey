
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ObjectiveGraphView } from './ObjectiveGraphView';
import { CreateAlignmentDialog } from './CreateAlignmentDialog';
import { ObjectiveWithRelations } from '@/types/okr';
import { Plus, AlertCircle } from 'lucide-react';
import './styles/ObjectiveFlowStyles.css';
import { useObjectiveConstraints } from '@/hooks/okr/useObjectiveConstraints';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { hasKeyResults, canCreateChildAlignments, isLoading } = useObjectiveConstraints(objective.id);
  
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
      
      {hasKeyResults && !isLoading && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            This objective has key results, so it can only be aligned as a child to other objectives (not as a parent).
          </AlertDescription>
        </Alert>
      )}
      
      <ObjectiveGraphView 
        objective={objective} 
        isAdmin={isAdmin} 
        canEdit={canEdit}
      />
      
      <CreateAlignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        sourceObjectiveId={objective.id}
        canCreateChildAlignments={canCreateChildAlignments}
      />
    </div>
  );
};
