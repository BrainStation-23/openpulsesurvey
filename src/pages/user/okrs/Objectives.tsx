
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useObjectives } from '@/hooks/okr/useObjectives';
import { ObjectiveCard } from '@/components/okr/objectives/ObjectiveCard';
import { CreateObjectiveForm } from '@/components/okr/objectives/CreateObjectiveForm';
import { CreateObjectiveInput } from '@/types/okr';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';

const UserObjectives = () => {
  const { objectives, isLoading, createObjective } = useObjectives();
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [objectiveChildCounts, setObjectiveChildCounts] = useState<Record<string, number>>({});

  // Get the most recent active cycle, or the first cycle if none are active
  const defaultCycleId = React.useMemo(() => {
    if (!cycles || cycles.length === 0) return "";
    const activeCycle = cycles.find(c => c.status === 'active');
    return activeCycle?.id || cycles[0].id;
  }, [cycles]);

  // Get child counts for objectives
  useEffect(() => {
    if (objectives && objectives.length > 0) {
      const counts: Record<string, number> = {};
      
      objectives.forEach(obj => {
        // Count how many objectives have this objective as parent
        const childCount = objectives.filter(o => o.parentObjectiveId === obj.id).length;
        counts[obj.id] = childCount;
      });
      
      setObjectiveChildCounts(counts);
    }
  }, [objectives]);

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
        <h1 className="text-3xl font-bold">My Objectives</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Objective
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Objectives List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : objectives && objectives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objectives.map((objective) => (
                <ObjectiveCard 
                  key={objective.id} 
                  objective={objective} 
                  isAdmin={false} 
                  childCount={objectiveChildCounts[objective.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You don't have any objectives yet. Create your first objective to get started.
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
            <DialogDescription>
              Create a new objective in an active OKR cycle
            </DialogDescription>
          </DialogHeader>
          <CreateObjectiveForm 
            onSubmit={handleCreateObjective} 
            isSubmitting={createObjective.isPending} 
            cycleId={defaultCycleId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserObjectives;
