
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCycleForm } from '@/components/okr/cycles/CreateCycleForm';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { CreateOKRCycleInput } from '@/types/okr';

const AdminCreateOKRCycle = () => {
  const navigate = useNavigate();
  const { createCycle } = useOKRCycles();

  const handleCreateCycle = async (data: CreateOKRCycleInput) => {
    try {
      await createCycle.mutateAsync(data);
      navigate('/admin/okrs/cycles');
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create OKR Cycle</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New OKR Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCycleForm 
            onSubmit={handleCreateCycle} 
            isSubmitting={createCycle.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateOKRCycle;
