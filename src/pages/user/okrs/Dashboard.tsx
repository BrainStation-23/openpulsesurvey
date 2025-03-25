
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowRight, Target, Calendar, Users, BarChart } from "lucide-react";
import { useObjectives } from '@/hooks/okr/useObjectives';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { Progress } from '@/components/ui/progress';
import { ObjectiveCard } from '@/components/okr/objectives/ObjectiveCard';
import { useObjectiveWithRelations } from '@/hooks/okr/useObjectiveWithRelations';

const UserOKRDashboard = () => {
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  
  const { cycles, isLoading: isLoadingCycles } = useOKRCycles();
  const { objectives, isLoading: isLoadingObjectives } = useObjectives(selectedCycle);
  
  // Get child counts for objectives
  const [objectiveChildCounts, setObjectiveChildCounts] = useState<Record<string, number>>({});
  
  // Auto-select the active cycle if available
  useEffect(() => {
    if (cycles && cycles.length > 0 && !selectedCycle) {
      const activeCycle = cycles.find(cycle => cycle.status === 'active');
      if (activeCycle) {
        setSelectedCycle(activeCycle.id);
      } else {
        // If no active cycle, select the most recent one
        const sortedCycles = [...cycles].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        if (sortedCycles.length > 0) {
          setSelectedCycle(sortedCycles[0].id);
        }
      }
    }
  }, [cycles, selectedCycle]);
  
  // Get child counts for objectives
  useEffect(() => {
    if (objectives && objectives.length > 0) {
      const counts: Record<string, number> = {};
      
      objectives.forEach(obj => {
        // Count how many objectives have this objective as parent
        const childCount = objectives.filter(o => o.parentObjectiveId === obj.id).length;
        counts[obj.id] = childCount;
      });
      
      setObjectiveChildCounts(counts);
    }
  }, [objectives]);

  const handleViewObjective = (id: string) => {
    navigate(`/user/okrs/objectives/${id}`);
  };

  const handleCreateObjective = () => {
    navigate('/user/okrs/objectives');
  };

  const activeCycle = cycles?.find(cycle => cycle.id === selectedCycle);
  
  // Calculate overall statistics
  const totalObjectives = objectives?.length || 0;
  const completedObjectives = objectives?.filter(o => o.status === 'completed').length || 0;
  const averageProgress = totalObjectives > 0 
    ? objectives?.reduce((sum, obj) => sum + obj.progress, 0) / totalObjectives 
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">My OKRs Dashboard</h1>
        <Button onClick={handleCreateObjective}>
          <Plus className="mr-2 h-4 w-4" />
          Create Objective
        </Button>
      </div>
      
      {isLoadingCycles ? (
        <Card>
          <CardContent className="pt-6">
            <div className="h-32 animate-pulse bg-muted rounded-md" />
          </CardContent>
        </Card>
      ) : cycles && cycles.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{totalObjectives}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
                  <Progress value={averageProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{completedObjectives} / {totalObjectives}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>OKR Cycles</CardTitle>
              <CardDescription>
                Select a cycle to view your objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={selectedCycle || ''} 
                onValueChange={(value) => setSelectedCycle(value)}
                className="w-full"
              >
                <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
                  {cycles.map((cycle) => (
                    <TabsTrigger 
                      key={cycle.id} 
                      value={cycle.id}
                      className="flex-shrink-0"
                    >
                      {cycle.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {activeCycle && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle>{activeCycle.name}</CardTitle>
                    <CardDescription>
                      {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {Math.ceil((new Date(activeCycle.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingObjectives ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 animate-pulse bg-muted rounded-md" />
                    ))}
                  </div>
                ) : objectives && objectives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {objectives.map((objective) => (
                      <ObjectiveCard 
                        key={objective.id} 
                        objective={objective}
                        childCount={objectiveChildCounts[objective.id] || 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You don't have any objectives for this cycle yet. Create your first objective to get started.
                    </p>
                    <Button onClick={handleCreateObjective} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Objective
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              No OKR cycles are available. Please contact your administrator to set up OKR cycles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserOKRDashboard;
