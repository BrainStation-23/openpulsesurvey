
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2, AlertTriangle, Edit, List, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useCycle } from '@/hooks/okr/useCycle';
import { CycleDetailHeader } from '@/components/okr/cycles/CycleDetailHeader';
import { EditCycleForm } from '@/components/okr/cycles/EditCycleForm';

export default function AdminCycleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const { 
    cycle, 
    objectiveStats,
    isLoading, 
    error,
    updateCycle,
    activateCycle,
    archiveCycle
  } = useCycle(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cycle details.
        </AlertDescription>
      </Alert>
    );
  }

  const handleUpdateCycle = async (data: any) => {
    try {
      await updateCycle.mutateAsync(data);
      setIsEditFormOpen(false);
    } catch (error) {
      console.error('Error updating cycle:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{cycle.name} | OKR Cycles | Align</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/okrs/cycles')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{cycle.name}</h1>
          </div>

          <Button onClick={() => setIsEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Cycle
          </Button>
        </div>
        
        {/* Cycle Header with Progress */}
        <CycleDetailHeader 
          cycle={cycle} 
          objectiveCount={objectiveStats.total}
          completedObjectives={objectiveStats.completed}
          onActivate={() => activateCycle.mutate()}
          onArchive={() => archiveCycle()}
          isUpdating={activateCycle.isPending || updateCycle.isPending}
        />
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-muted-foreground">
                {cycle.description || 'No description provided for this OKR cycle.'}
              </p>
            </div>
            
            {/* For now just show a placeholder, this would be filled with real data */}
            <div className="p-4 border rounded-lg flex items-center justify-center h-64 text-muted-foreground">
              Cycle overview content would go here
            </div>
          </TabsContent>
          
          <TabsContent value="objectives" className="space-y-4">
            {objectiveStats.total === 0 ? (
              <div className="p-8 text-center border rounded-lg">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Objectives Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating objectives for this OKR cycle.
                </p>
                <Button onClick={() => navigate('/admin/okrs/objectives/create', { state: { cycleId: id } })}>
                  Create First Objective
                </Button>
              </div>
            ) : (
              <div className="p-4 border rounded-lg flex items-center justify-center h-64 text-muted-foreground">
                <List className="mr-2 h-4 w-4" />
                {objectiveStats.total} objectives would be listed here
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center justify-center h-64 text-muted-foreground">
              Performance metrics and charts would go here
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Form Sheet */}
        <Sheet open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Cycle</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {cycle && (
                <EditCycleForm 
                  cycle={cycle}
                  onClose={() => setIsEditFormOpen(false)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
