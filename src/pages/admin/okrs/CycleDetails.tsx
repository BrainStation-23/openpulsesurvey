
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, CalendarRange, Clock, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useOKRCycle } from '@/hooks/okr/useOKRCycle';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { CycleStatusBadge } from '@/components/okr/cycles/CycleStatusBadge';
import { CreateObjectiveForm } from '@/components/okr/objectives/CreateObjectiveForm';
import { OKRCycleStatus, CreateObjectiveInput } from '@/types/okr';
import { EditCycleForm } from '@/components/okr/cycles/EditCycleForm';
import { DeleteCycleDialog } from '@/components/okr/cycles/DeleteCycleDialog';
import { useToast } from '@/hooks/use-toast';
import { useObjectivesByVisibility } from '@/hooks/okr/useObjectivesByVisibility';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Building2, Building, Users2, User } from "lucide-react";

const AdminOKRCycleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cycle, isLoading, error, updateStatus } = useOKRCycle(id);
  const { createObjective } = useObjectives(id);
  
  // Use the more robust objectives by visibility hook
  const { 
    objectives, 
    organizationalObjectives,
    departmentalObjectives,
    teamObjectives,
    privateObjectives,
    isLoading: isLoadingObjectives,
    selectedCategory,
    setSelectedCategory 
  } = useObjectivesByVisibility(id);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleStatusChange = (status: string) => {
    updateStatus.mutate(status as OKRCycleStatus);
  };

  const handleCreateObjective = (data: CreateObjectiveInput) => {
    createObjective.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Objective created successfully",
        });
      }
    });
  };

  const handleEditCycle = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteCycle = () => {
    setDeleteDialogOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-40 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="outline" asChild className="mb-6">
          <Link to="/admin/okrs/cycles">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error ? error.message : 'Failed to load OKR cycle details'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="outline" asChild className="mb-2">
        <Link to="/admin/okrs/cycles">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cycles
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{cycle.name}</h1>
          <p className="text-muted-foreground">{cycle.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <CycleStatusBadge status={cycle.status} />
          <Select 
            defaultValue={cycle.status} 
            onValueChange={handleStatusChange}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleEditCycle}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit Cycle
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDeleteCycle}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Cycle
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Cycle Information</CardTitle>
          <CardDescription>
            Details about this OKR cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Duration</p>
              <div className="flex items-center">
                <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {format(cycle.startDate, 'MMMM d, yyyy')} - {format(cycle.endDate, 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Created</p>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{format(cycle.createdAt, 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          
          {cycle.status === 'active' && (
            <div className="bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">This cycle is currently active</p>
                <p className="text-sm">
                  All objectives associated with this cycle are available for users to update.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Objectives</CardTitle>
            <CardDescription>
              Objectives associated with this OKR cycle
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Objective
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Objective Visibility</h3>
            <Tabs 
              value={selectedCategory} 
              onValueChange={(value) => setSelectedCategory(value as any)}
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

            {isLoadingObjectives ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : displayedObjectives && displayedObjectives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedObjectives.map((objective) => (
                  <div key={objective.id}>
                    {/* Use the ObjectiveCardEnhanced component directly */}
                    {React.createElement(React.lazy(() => import('@/components/okr/objectives/ObjectiveCardEnhanced')), {
                      objective,
                      childCount: displayedObjectives.filter(o => o.parentObjectiveId === objective.id).length,
                      isAdmin: true
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No {selectedCategory !== 'all' ? selectedCategory : ''} objectives found in this cycle.
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

      {/* Create Objective Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Objective</DialogTitle>
          </DialogHeader>
          <CreateObjectiveForm 
            onSubmit={handleCreateObjective} 
            isSubmitting={createObjective.isPending} 
            cycleId={cycle.id}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Cycle Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit OKR Cycle</DialogTitle>
            <DialogDescription>
              Update the details of this OKR cycle
            </DialogDescription>
          </DialogHeader>
          {cycle && (
            <EditCycleForm 
              cycle={cycle}
              onClose={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Cycle Dialog */}
      {cycle && (
        <DeleteCycleDialog
          cycle={cycle}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
};

export default AdminOKRCycleDetails;
