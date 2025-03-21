
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowRight } from "lucide-react";
import { useObjectives } from '@/hooks/okr/useObjectives';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { Progress } from '@/components/ui/progress';

const UserOKRDashboard = () => {
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  
  const { cycles, isLoading: isLoadingCycles } = useOKRCycles();
  const { objectives, isLoading: isLoadingObjectives } = useObjectives(selectedCycle);
  
  // Auto-select the active cycle if available
  React.useEffect(() => {
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

  const handleViewObjective = (id: string) => {
    navigate(`/user/okrs/objectives/${id}`);
  };

  const handleCreateObjective = () => {
    navigate('/user/okrs/objectives');
  };

  const activeCycle = cycles?.find(cycle => cycle.id === selectedCycle);

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
                <CardTitle>{activeCycle.name}</CardTitle>
                <CardDescription>
                  {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingObjectives ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 animate-pulse bg-muted rounded-md" />
                    ))}
                  </div>
                ) : objectives && objectives.length > 0 ? (
                  <div className="space-y-6">
                    {objectives.map((objective) => (
                      <div key={objective.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <div className="flex items-center gap-2 mb-2 md:mb-0">
                            <h3 className="text-lg font-medium">{objective.title}</h3>
                            <ObjectiveStatusBadge status={objective.status} />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewObjective(objective.id)}
                          >
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm">{objective.progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={objective.progress} className="h-2" />
                        </div>
                        
                        {objective.description && (
                          <p className="text-sm text-muted-foreground mb-4">{objective.description}</p>
                        )}
                      </div>
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
