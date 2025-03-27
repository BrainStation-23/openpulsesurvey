
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateObjectiveInput } from '@/types/okr';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { useToast } from '@/hooks/use-toast';
import { ObjectiveFormWithPermissions } from '@/components/okr/objectives/ObjectiveFormWithPermissions';

const CreateObjectivePage = () => {
  const navigate = useNavigate();
  const { createObjective } = useObjectives();
  const { toast } = useToast();

  const handleCreateObjective = (data: CreateObjectiveInput) => {
    createObjective.mutate(data, {
      onSuccess: (response: any) => {
        toast({
          title: 'Success',
          description: 'Objective created successfully',
        });
        
        // Navigate to the new objective
        if (response?.id) {
          navigate(`/dashboard/okrs/objectives/${response.id}`);
        } else {
          navigate('/dashboard/okrs/objectives');
        }
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to create objective: ${error.message}`,
        });
      }
    });
  };

  const handleCancel = () => {
    navigate('/dashboard/okrs/objectives');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Objective</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Objective Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ObjectiveFormWithPermissions
            onSubmit={handleCreateObjective}
            isSubmitting={createObjective.isPending}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateObjectivePage;
