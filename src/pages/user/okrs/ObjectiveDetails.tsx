
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertTriangle, Edit, Trash2, Link } from "lucide-react";
import { useObjective } from '@/hooks/okr/useObjective';
import { ObjectiveProgress } from '@/components/okr/objectives/ObjectiveProgress';
import { ObjectiveFormWithPermissions } from '@/components/okr/objectives/ObjectiveFormWithPermissions';
import { KeyResultsListWithPermissions } from '@/components/okr/key-results/KeyResultsListWithPermissions';
import { UpdateObjectiveInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ObjectiveAlignments } from '@/components/okr/objectives/ObjectiveAlignments';
import { ObjectiveVisibilityBadge } from '@/components/okr/objectives/ObjectiveVisibilityBadge';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';

const ObjectiveDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, isAdmin } = useCurrentUser();
  const [editMode, setEditMode] = useState(false);
  const { 
    objective, 
    isLoading, 
    isError, 
    updateObjective, 
    deleteObjective,
    refetch 
  } = useObjective(id);

  const isOwner = objective?.ownerId === userId;
  const canEdit = isAdmin || isOwner;

  const handleUpdate = (data: UpdateObjectiveInput) => {
    if (!id) return;
    
    updateObjective.mutate({ ...data, id }, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Objective updated successfully',
        });
        setEditMode(false);
        refetch();
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to update objective: ${error.message}`,
        });
      }
    });
  };

  const handleDelete = () => {
    if (!id) return;
    
    deleteObjective.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Objective deleted successfully',
        });
        navigate('/dashboard/okrs/objectives');
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to delete objective: ${error.message}`,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-8 w-2/3 bg-gray-200 animate-pulse rounded my-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded my-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded my-2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !objective) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Objective Not Found</h2>
            <p className="text-muted-foreground mb-4">The objective you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/dashboard/okrs/objectives')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Objectives
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center">
          <Button onClick={() => setEditMode(false)} variant="outline" className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <h1 className="text-3xl font-bold">Edit Objective</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <ObjectiveFormWithPermissions
              onSubmit={handleUpdate}
              isSubmitting={updateObjective.isPending}
              objective={objective}
              onCancel={() => setEditMode(false)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button onClick={() => navigate('/dashboard/okrs/objectives')} variant="outline" className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{objective.title}</h1>
        </div>
        
        {canEdit && (
          <div className="flex space-x-2">
            <Button onClick={() => setEditMode(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this objective? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => document.querySelector('[role=dialog]')?.dispatchEvent(new Event('close', { bubbles: true }))}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Objective Details</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <ObjectiveVisibilityBadge visibility={objective.visibility} />
                <ObjectiveStatusBadge status={objective.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {objective.description || "No description provided."}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Progress</h3>
                <ObjectiveProgress progress={objective.progress} status={objective.status} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <KeyResultsListWithPermissions objectiveId={objective.id} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Alignments
              </CardTitle>
              <CardDescription>
                How this objective aligns with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectiveAlignments objectiveId={objective.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveDetailsPage;
