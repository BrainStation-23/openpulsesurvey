
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ObjectiveDetailsContent } from '@/components/okr/objectives/shared/ObjectiveDetailsContent';
import { useToast } from '@/hooks/use-toast';

export default function AdminObjectiveDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  const { data: objective, isLoading, error } = useQuery({
    queryKey: ['admin', 'objective', id],
    queryFn: async () => {
      // Mock function until we have the real API functions
      console.log("Fetching objective details for:", id);
      return { id, title: "Sample Objective", status: "active" };
    }
  });

  const { data: keyResults = [] } = useQuery({
    queryKey: ['admin', 'keyResults', id],
    queryFn: async () => {
      // Mock function until we have the real API functions
      console.log("Fetching key results for:", id);
      return [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !objective) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load objective details.
        </AlertDescription>
      </Alert>
    );
  }

  const handleUpdateObjective = async (data: any) => {
    try {
      // Mock update function
      console.log("Updating objective:", data);
      toast({
        title: 'Success',
        description: 'Objective updated successfully',
      });
      setIsEditFormOpen(false);
    } catch (error) {
      console.error('Error updating objective:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update objective',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{objective.title} | OKRs | Align</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/okrs/objectives')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{objective.title}</h1>
          </div>

          <Button onClick={() => setIsEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Objective
          </Button>
        </div>

        <ObjectiveDetailsContent
          objective={objective as any}
          keyResults={keyResults}
          isAdmin={true}
          canEditObjective={true}
        />

        {/* Edit Form Sheet */}
        <Sheet open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Objective</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <p>Edit form would go here</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditFormOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateObjective({})} type="button">
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
