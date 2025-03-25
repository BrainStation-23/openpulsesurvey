
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { DashboardMetrics } from '@/components/okr/admin-dashboard/DashboardMetrics';
import { StatusPieChart } from '@/components/okr/admin-dashboard/StatusPieChart';
import { ProgressBarChart } from '@/components/okr/admin-dashboard/ProgressBarChart';
import { ObjectivesList } from '@/components/okr/admin-dashboard/ObjectivesList';

const AdminOKRDashboard = () => {
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const { objectives, isLoading: objectivesLoading } = useObjectives();
  
  const activeCycle = cycles?.find(cycle => cycle.status === 'active');
  const cycleObjectives = objectives?.filter(obj => obj.cycleId === activeCycle?.id) || [];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKRs Dashboard</h1>
      </div>
      
      <DashboardMetrics 
        activeCycle={activeCycle} 
        cycleObjectives={cycleObjectives}
        cyclesLoading={cyclesLoading}
        objectivesLoading={objectivesLoading}
      />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StatusPieChart objectives={cycleObjectives} />
            <ProgressBarChart objectives={cycleObjectives} />
          </div>
        </TabsContent>
        
        <TabsContent value="objectives">
          <ObjectivesList 
            objectives={cycleObjectives} 
            activeCycleName={activeCycle?.name}
            isLoading={objectivesLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOKRDashboard;
