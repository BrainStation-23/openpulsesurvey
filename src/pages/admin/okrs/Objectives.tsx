
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Building2, Building, Users2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { ObjectivesGrid } from '@/components/okr/objectives/ObjectivesGrid';
import { CreateObjectiveForm } from '@/components/okr/objectives/CreateObjectiveForm';
import { CreateObjectiveInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { ObjectiveVisibilityCategory, useObjectivesByVisibility } from '@/hooks/okr/useObjectivesByVisibility';
import { useObjectives } from '@/hooks/okr/useObjectives';

const AdminAllObjectives = () => {
  const { toast } = useToast();
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ObjectiveVisibilityCategory>('all');
  
  // Get the most recent active cycle, or the first cycle if none are active
  const defaultCycleId = React.useMemo(() => {
    if (!cycles || cycles.length === 0) return "";
    const activeCycle = cycles.find(c => c.status === 'active');
    return activeCycle?.id || cycles[0].id;
  }, [cycles]);

  // Use the visibility-filtered objectives hook
  const { 
    objectives, 
    organizationalObjectives,
    departmentalObjectives,
    teamObjectives,
    privateObjectives,
    isLoading, 
    refetch, 
  } = useObjectivesByVisibility();
  
  // Use the regular objectives hook for the createObjective mutation
  const { createObjective } = useObjectives();
  
  // Determine which objectives to show based on selected category
  const displayedObjectives = selectedCategory === 'all' 
    ? objectives 
    : selectedCategory === 'organization' 
      ? organizationalObjectives
      : selectedCategory === 'department'
        ? departmentalObjectives
        : selectedCategory === 'team'
          ? teamObjectives
          : privateObjectives;

  const handleCreateObjective = (data: CreateObjectiveInput) => {
    createObjective.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        // Immediately refetch objectives to show the newly created one
        refetch();
        toast({
          title: 'Success',
          description: 'Objective created successfully',
        });
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
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Objective Visibility</h3>
            <Tabs 
              value={selectedCategory} 
              onValueChange={(value) => setSelectedCategory(value as ObjectiveVisibilityCategory)}
              className="w-full"
            >
              <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="organization" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>Organization</span>
                </TabsTrigger>
                <TabsTrigger value="department" className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>Department</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  <Users2 className="h-4 w-4" />
                  <span>Team</span>
                </TabsTrigger>
                <TabsTrigger value="private" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Private</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : displayedObjectives && displayedObjectives.length > 0 ? (
              <ObjectivesGrid objectives={displayedObjectives} isLoading={isLoading} isAdmin={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No {selectedCategory !== 'all' ? selectedCategory : ''} objectives found. Create your first objective to get started.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Objective
                </Button>
              </div>
            )}
          </div>
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

export default AdminAllObjectives;
