import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useObjectives } from '@/hooks/okr/useObjectives';
import { CreateObjectiveForm } from '@/components/okr/objectives/CreateObjectiveForm';
import { CreateObjectiveInput } from '@/types/okr';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { useToast } from '@/hooks/use-toast';
import { useSBUs } from '@/hooks/okr/useSBUs';
import { ObjectivesFilterPanel } from '@/components/okr/objectives/filters/ObjectivesFilterPanel';
import { PaginatedObjectivesGrid } from '@/components/okr/objectives/PaginatedObjectivesGrid';
import { useFilteredObjectives } from '@/hooks/okr/useFilteredObjectives';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from "@/components/ui/input";
import { useObjectivePermissions } from '@/hooks/okr/useObjectivePermissions';

const UserObjectives = () => {
  const { toast } = useToast();
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const { sbus, isLoading: sbusLoading } = useSBUs();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if user can create objectives
  const { canCreateObjective } = useObjectivePermissions();
  
  // Get the most recent active cycle, or the first cycle if none are active
  const defaultCycleId = React.useMemo(() => {
    if (!cycles || cycles.length === 0) return "";
    const activeCycle = cycles.find(c => c.status === 'active');
    return activeCycle?.id || cycles[0].id;
  }, [cycles]);

  // Use the filtered objectives hook
  const {
    objectives,
    filters,
    isLoading,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    handleFilterChange,
    handleSearchChange,
    refetch
  } = useFilteredObjectives(false); // false for user view

  // Use the regular objectives hook for the createObjective mutation and child counts
  const { createObjective, objectiveChildCounts } = useObjectives();

  // Handle search input changes with debounce
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearchChange(e.target.value);
  };

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
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create objective',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Objectives</h1>
        {canCreateObjective && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Objective
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Create a new objective in the current OKR cycle
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or owner name..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={handleSearchInput}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <ObjectivesFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            cycles={cycles || []}
            sbus={sbus || []}
            cyclesLoading={cyclesLoading}
            sbusLoading={sbusLoading}
          />
        </div>
        
        {/* Main content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>My Objectives List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <PaginatedObjectivesGrid 
              objectives={objectives || []}
              isLoading={isLoading}
              isAdmin={false}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              objectiveChildCounts={objectiveChildCounts}
            />
          </CardContent>
        </Card>
      </div>

      {canCreateObjective && (
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
              hideParentObjective={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserObjectives;
