
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickCreateCycleForm } from '@/components/okr/cycles/QuickCreateCycleForm';
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
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/admin/okrs/cycles')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create OKR Cycle</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New OKR Cycle</CardTitle>
          <CardDescription>
            Define a time period for tracking and achieving your organization's objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="quick">Quick Create</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick">
              <div className="p-1">
                <QuickCreateCycleForm 
                  onSubmit={handleCreateCycle} 
                  isSubmitting={createCycle.isPending} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="p-1">
                <CreateCycleForm 
                  onSubmit={handleCreateCycle} 
                  isSubmitting={createCycle.isPending} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateOKRCycle;
