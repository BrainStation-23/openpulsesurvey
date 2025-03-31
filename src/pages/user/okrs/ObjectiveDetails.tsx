
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Info, ChevronDown, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useObjective } from '@/hooks/okr/useObjective';
import { useObjectiveWithRelations } from '@/hooks/okr/useObjectiveWithRelations';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ObjectiveStatus, UpdateObjectiveInput } from '@/types/okr';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EditObjectiveForm } from '@/components/okr/objectives/EditObjectiveForm';
import { KeyResultsList } from '@/components/okr/key-results/KeyResultsList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ObjectiveAlignmentManager } from '@/components/okr/alignments/ObjectiveAlignmentManager';
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PermissionsList } from '@/components/okr/permissions/PermissionsList';
import { useObjectiveStatusUpdates } from '@/hooks/okr/useObjectiveStatusUpdates';
import { ObjectiveDetailsView } from '@/components/okr/objectives/ObjectiveDetailsView';

const UserObjectiveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { userId, isAdmin } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("details");
  
  const { 
    objective, 
    isLoading, 
    error,
    updateStatus,
    updateObjective,
    deleteObjective,
    isDeleting
  } = useObjective(id);
  
  const { 
    objective: objectiveWithRelations 
  } = useObjectiveWithRelations(id);

  const { data: keyResults = [] } = useKeyResults(id);
  const completedKeyResults = keyResults.filter(kr => kr.status === 'completed').length;
  
  const { data: creatorInfo } = useQuery({
    queryKey: ['user', objective?.ownerId],
    queryFn: async () => {
      if (!objective?.ownerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', objective.ownerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!objective?.ownerId
  });
  
  const isOwner = objective && userId === objective.ownerId;
  const canEdit = isOwner || isAdmin;
  
  const { 
    canChangeStatus, 
    handleStatusUpdate,
    isUpdating
  } = useObjectiveStatusUpdates({
    objective,
    canEdit,
    updateStatus: updateStatus.mutate
  });
  
  const handleDelete = () => {
    if (!canEdit) return;
    
    deleteObjective.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate('/user/okrs/objectives');
      }
    });
  };

  const handleEdit = (data: UpdateObjectiveInput) => {
    if (!canEdit) return;
    
    updateObjective.mutate(data, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
      }
    });
  };
  
  const handleBack = () => {
    navigate('/user/okrs/objectives');
  };
  
  const creatorName = creatorInfo 
    ? `${creatorInfo.first_name || ''} ${creatorInfo.last_name || ''}`.trim() 
    : 'Loading...';
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !objective) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Objective Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <Info className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-medium">The requested objective could not be found</h2>
              <p className="text-muted-foreground">
                The objective may have been deleted or you may not have permission to view it.
              </p>
              <Button onClick={handleBack}>Return to Objectives</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Objective Details</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{objective.title}</CardTitle>
              {objective.description && (
                <CardDescription className="mt-2">{objective.description}</CardDescription>
              )}
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="h-3 w-3 mr-1" /> 
                <span>Created by: {creatorName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit ? (
                <div className="flex items-center gap-2">
                  {canChangeStatus ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          disabled={isUpdating}
                        >
                          <ObjectiveStatusBadge status={objective.status} />
                          <ChevronDown className="h-4 w-4" />
                          {isUpdating && <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusUpdate('draft')}>
                          Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('at_risk')}>
                          At Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('on_track')}>
                          On Track
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ObjectiveStatusBadge status={objective.status} />
                      {objective.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-800">
                          Completed objectives can't be edited
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ) : (
                <ObjectiveStatusBadge status={objective.status} className="ml-2" />
              )}
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4 w-[400px]">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="key-results">Key Results</TabsTrigger>
              <TabsTrigger value="alignments">Alignments</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="mt-0">
            <CardContent className="pt-6">
              {objectiveWithRelations && (
                <ObjectiveDetailsView 
                  objective={objectiveWithRelations}
                  creatorName={creatorName}
                  keyResultsCount={keyResults.length}
                  completedKeyResults={completedKeyResults}
                />
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="key-results" className="mt-0">
            <CardContent className="pt-6">
              {id && <KeyResultsList objectiveId={id} canEdit={canEdit} />}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="alignments" className="mt-0">
            {objectiveWithRelations && (
              <CardContent className="pt-6">
                <ObjectiveAlignmentManager
                  objective={objectiveWithRelations}
                  isAdmin={isAdmin}
                  canEdit={canEdit}
                />
              </CardContent>
            )}
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-0">
            <CardContent className="pt-6">
              <PermissionsList 
                objectiveId={id} 
                canManagePermissions={canEdit}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-end pt-0">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(objective.updatedAt).toLocaleString()}
          </p>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this objective?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the objective
              and any associated key results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
          </DialogHeader>
          {objective && (
            <EditObjectiveForm 
              objective={objective} 
              onSubmit={handleEdit} 
              isSubmitting={updateObjective.isPending} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserObjectiveDetails;
