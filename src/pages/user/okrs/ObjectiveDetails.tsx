
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Info, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  
  const isOwner = objective && userId === objective.ownerId;
  const canEdit = isOwner || isAdmin;
  
  const handleStatusUpdate = (status: ObjectiveStatus) => {
    if (!id || !canEdit) return;
    
    updateStatus.mutate({ 
      status
    });
  };
  
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
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ObjectiveStatusBadge status={objective.status} />
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusUpdate('draft')}>
                        Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('in_progress')}>
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('at_risk')}>
                        At Risk
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('on_track')}>
                        On Track
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
                        <Check className="h-4 w-4 mr-2" />
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              {!canEdit && (
                <ObjectiveStatusBadge status={objective.status} className="ml-2" />
              )}
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="alignments">Alignments</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="mt-0">
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <dt className="font-medium">Progress</dt>
                      <dd className="text-right">
                        <div className="flex items-center">
                          <div className="w-32 bg-muted rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary rounded-full h-2" 
                              style={{ width: `${objective.progress || 0}%` }}
                            />
                          </div>
                          <span>{objective.progress?.toFixed(0) || 0}%</span>
                        </div>
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <dt className="font-medium">Visibility</dt>
                      <dd className="text-right">
                        <Badge variant="outline">
                          {objective.visibility.charAt(0).toUpperCase() + objective.visibility.slice(1).replace('_', ' ')}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Relationships</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-1 border-b">
                      <dt className="font-medium">OKR Cycle</dt>
                      <dd className="text-right">
                        <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/user/okrs/dashboard?cycleId=${objective.cycleId}`)}>
                          View Cycle
                        </Button>
                      </dd>
                    </div>
                    {objective.parentObjectiveId && (
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Parent Objective</dt>
                        <dd className="text-right">
                          <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/user/okrs/objectives/${objective.parentObjectiveId}`)}>
                            View Parent
                          </Button>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {id && <KeyResultsList objectiveId={id} />}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="alignments" className="mt-0">
            {objectiveWithRelations && (
              <CardContent>
                <ObjectiveAlignmentManager
                  objective={objectiveWithRelations}
                  isAdmin={false}
                  canEdit={canEdit}
                />
              </CardContent>
            )}
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
        <DialogContent className="sm:max-w-[600px]">
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
