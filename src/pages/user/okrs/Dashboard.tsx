import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowRight, Target, Calendar, Users, BarChart, Building2, Building, User, Users2 } from "lucide-react";
import { useObjectivesByVisibility, ObjectiveVisibilityCategory } from '@/hooks/okr/useObjectivesByVisibility';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { Progress } from '@/components/ui/progress';
import { ObjectiveCardEnhanced } from '@/components/okr/objectives/ObjectiveCardEnhanced';
import { useCurrentUser } from '@/hooks/useCurrentUser';
const UserOKRDashboard = () => {
  const navigate = useNavigate();
  const {
    user
  } = useCurrentUser();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const {
    cycles,
    isLoading: isLoadingCycles
  } = useOKRCycles();
  const {
    objectives,
    organizationalObjectives,
    departmentalObjectives,
    teamObjectives,
    privateObjectives,
    selectedCategory,
    setSelectedCategory,
    isLoading: isLoadingObjectives,
    refetch
  } = useObjectivesByVisibility(selectedCycle || undefined);
  const [objectiveChildCounts, setObjectiveChildCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    if (cycles && cycles.length > 0 && !selectedCycle) {
      const activeCycle = cycles.find(cycle => cycle.status === 'active');
      if (activeCycle) {
        setSelectedCycle(activeCycle.id);
      } else {
        const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        if (sortedCycles.length > 0) {
          setSelectedCycle(sortedCycles[0].id);
        }
      }
    }
  }, [cycles, selectedCycle]);
  useEffect(() => {
    if (objectives && objectives.length > 0) {
      const counts: Record<string, number> = {};
      objectives.forEach(obj => {
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
  const displayedObjectives = selectedCategory === 'all' ? objectives : selectedCategory === 'organization' ? organizationalObjectives : selectedCategory === 'department' ? departmentalObjectives : selectedCategory === 'team' ? teamObjectives : privateObjectives;
  const totalObjectives = displayedObjectives?.length || 0;
  const completedObjectives = displayedObjectives?.filter(o => o.status === 'completed').length || 0;
  const averageProgress = totalObjectives > 0 ? displayedObjectives?.reduce((sum, obj) => sum + obj.progress, 0) / totalObjectives : 0;
  return <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">My OKRs Dashboard</h1>
        
      </div>
      
      {isLoadingCycles ? <Card>
          <CardContent className="pt-6">
            <div className="h-32 animate-pulse bg-muted rounded-md" />
          </CardContent>
        </Card> : cycles && cycles.length > 0 ? <>
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
              <Tabs value={selectedCycle || ''} onValueChange={value => setSelectedCycle(value)} className="w-full">
                <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
                  {cycles.map(cycle => <TabsTrigger key={cycle.id} value={cycle.id} className="flex-shrink-0">
                      {cycle.name}
                    </TabsTrigger>)}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {activeCycle && <Card>
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
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Objective Visibility</h3>
                  <Tabs value={selectedCategory} onValueChange={value => setSelectedCategory(value as ObjectiveVisibilityCategory)} className="w-full">
                    <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
                      <TabsTrigger value="all" className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>All</span>
                      </TabsTrigger>
                      <TabsTrigger value="organization" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>Organization</span>
                      </TabsTrigger>
                      <TabsTrigger value="department" className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>Department</span>
                      </TabsTrigger>
                      <TabsTrigger value="team" className="flex items-center gap-1">
                        <Users2 className="h-4 w-4" />
                        <span>Team</span>
                      </TabsTrigger>
                      <TabsTrigger value="private" className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Private</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {isLoadingObjectives ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse bg-muted rounded-md" />)}
                    </div> : displayedObjectives.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayedObjectives.map(objective => <ObjectiveCardEnhanced key={objective.id} objective={objective} childCount={objectiveChildCounts[objective.id] || 0} keyResultsCount={objective.keyResultsCount} />)}
                    </div> : <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No {selectedCategory !== 'all' ? selectedCategory : ''} objectives found for this cycle.
                      </p>
                      <Button onClick={handleCreateObjective} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Objective
                      </Button>
                    </div>}
                </div>
              </CardContent>
            </Card>}
        </> : <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              No OKR cycles are available. Please contact your administrator to set up OKR cycles.
            </p>
          </CardContent>
        </Card>}
    </div>;
};
export default UserOKRDashboard;