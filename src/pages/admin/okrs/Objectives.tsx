
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Target, 
  Building2, 
  Building, 
  Users2, 
  User, 
  Search,
  Filter 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  
  // Get the most recent active cycle, or the first cycle if none are active
  const defaultCycleId = React.useMemo(() => {
    if (!cycles || cycles.length === 0) return "";
    const activeCycle = cycles.find(c => c.status === 'active');
    return activeCycle?.id || cycles[0].id;
  }, [cycles]);

  // Set the default cycle when cycles are loaded
  useEffect(() => {
    if (!selectedCycleId && defaultCycleId) {
      console.log('Setting default cycle ID:', defaultCycleId);
      setSelectedCycleId(defaultCycleId);
    }
  }, [defaultCycleId, selectedCycleId]);

  // Use the visibility-filtered objectives hook with cycle filter
  const { 
    objectives, 
    organizationalObjectives,
    departmentalObjectives,
    teamObjectives,
    privateObjectives,
    selectedCategory,
    setSelectedCategory,
    isLoading, 
    refetch, 
  } = useObjectivesByVisibility(selectedCycleId);
  
  // Use the regular objectives hook for the createObjective mutation
  const { createObjective } = useObjectives();
  
  // Filter objectives based on search query
  const filterObjectivesBySearch = (objectives) => {
    if (!searchQuery.trim()) return objectives;
    
    return objectives.filter(obj => 
      obj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (obj.description && obj.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  // Determine which objectives to show based on selected category and search query
  const categoryFilteredObjectives = selectedCategory === 'all' 
    ? objectives 
    : selectedCategory === 'organization' 
      ? organizationalObjectives
      : selectedCategory === 'department'
        ? departmentalObjectives
        : selectedCategory === 'team'
          ? teamObjectives
          : privateObjectives;
  
  const displayedObjectives = filterObjectivesBySearch(categoryFilteredObjectives);

  // Log current state to help debug
  useEffect(() => {
    console.log('Current cycle ID:', selectedCycleId);
    console.log('Objectives count:', objectives?.length || 0);
    console.log('Displayed objectives count:', displayedObjectives?.length || 0);
  }, [selectedCycleId, objectives, displayedObjectives]);

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

  // Find the selected cycle name
  const selectedCycleName = cycles?.find(c => c.id === selectedCycleId)?.name || "All Cycles";

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
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedCycleId}
                onValueChange={(value) => {
                  console.log('Selecting cycle:', value);
                  setSelectedCycleId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by cycle" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {cyclesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading cycles...
                    </SelectItem>
                  ) : cycles && cycles.length > 0 ? (
                    cycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name} {cycle.status === 'active' ? '(Active)' : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No cycles found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
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

            {selectedCycleId && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing objectives for: <span className="font-medium">{selectedCycleName}</span>
                  {searchQuery && <span> | Search: "{searchQuery}"</span>}
                </p>
              </div>
            )}

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
                  {searchQuery 
                    ? "No objectives match your search criteria." 
                    : `No ${selectedCategory !== 'all' ? selectedCategory : ''} objectives found for this cycle.`}
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
            cycleId={selectedCycleId || defaultCycleId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAllObjectives;
