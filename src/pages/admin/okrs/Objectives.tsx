
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useObjectives } from '@/hooks/okr/useObjectives';
import { ObjectivesGrid } from '@/components/okr/objectives/ObjectivesGrid';
import { CreateObjectiveForm } from '@/components/okr/objectives/CreateObjectiveForm';
import { CreateObjectiveInput } from '@/types/okr';

const AdminAllObjectives = () => {
  const { objectives, isLoading, createObjective } = useObjectives();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateObjective = (data: CreateObjectiveInput) => {
    createObjective.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Objectives</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Objective
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : objectives && objectives.length > 0 ? (
            <ObjectivesGrid objectives={objectives} isLoading={isLoading} isAdmin={true} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No objectives found. Create your first objective to get started.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Objective
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Objective</DialogTitle>
          </DialogHeader>
          <CreateObjectiveForm 
            onSubmit={handleCreateObjective} 
            isSubmitting={createObjective.isPending} 
            cycleId=""
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAllObjectives;
