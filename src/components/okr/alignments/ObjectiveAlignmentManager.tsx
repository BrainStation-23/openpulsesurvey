
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("hierarchy");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Objective Alignments</h3>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-64">
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="aligned">Aligned Objectives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hierarchy" className="pt-4">
          <ObjectiveHierarchyView 
            objective={objective} 
            isAdmin={isAdmin} 
          />
        </TabsContent>
        
        <TabsContent value="aligned" className="pt-4">
          <AlignedObjectivesView 
            objectiveId={objective.id} 
            isAdmin={isAdmin} 
            canEdit={canEdit}
          />
        </TabsContent>
      </Tabs>

      <CreateAlignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        sourceObjectiveId={objective.id}
      />
    </div>
  );
};
