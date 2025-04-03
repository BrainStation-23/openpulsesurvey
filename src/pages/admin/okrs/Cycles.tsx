
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Grid, List, Clock, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { CyclesGrid } from '@/components/okr/cycles/CyclesGrid';
import { CycleTimeline } from '@/components/okr/cycles/CycleTimeline';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';

const AdminOKRCycles = () => {
  const { cycles, isLoading, error } = useOKRCycles();
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [cycleFilter, setCycleFilter] = useState<'all' | 'yearly' | 'quarterly' | 'monthly'>('all');

  // Filter for active cycle
  const activeCycle = cycles?.find(cycle => cycle.status === 'active');

  // Calculate cycle type based on duration
  const getCycleType = (startDate: Date, endDate: Date) => {
    const monthsDiff = endDate.getMonth() - startDate.getMonth() + 
      (12 * (endDate.getFullYear() - startDate.getFullYear()));
    
    if (monthsDiff >= 11) return 'yearly';
    if (monthsDiff >= 2) return 'quarterly';
    return 'monthly';
  };
  
  // Group cycles by type
  const groupedCycles = React.useMemo(() => {
    if (!cycles) return { yearly: [], quarterly: [], monthly: [] };
    
    return cycles.reduce((acc, cycle) => {
      const cycleType = getCycleType(
        new Date(cycle.startDate), 
        new Date(cycle.endDate)
      );
      acc[cycleType].push({...cycle, cycleType});
      return acc;
    }, { yearly: [], quarterly: [], monthly: [] });
  }, [cycles]);

  // Filter cycles based on selected type
  const filteredCycles = React.useMemo(() => {
    if (cycleFilter === 'all') return cycles || [];
    return cycles?.filter(cycle => {
      const cycleType = getCycleType(new Date(cycle.startDate), new Date(cycle.endDate));
      return cycleType === cycleFilter;
    }) || [];
  }, [cycles, cycleFilter]);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Cycles</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('timeline')} 
            className={viewMode === 'timeline' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}>
            <List className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}>
            <Grid className="mr-2 h-4 w-4" />
            Grid
          </Button>
          <Button asChild>
            <Link to="/admin/okrs/cycles/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Cycle
            </Link>
          </Button>
        </div>
      </div>
      
      {activeCycle && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Active Cycle</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to={`/admin/okrs/cycles/${activeCycle.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium">{activeCycle.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(activeCycle.startDate), 'MMM d, yyyy')} - {format(new Date(activeCycle.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>Active now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cycle Type Filter */}
      <div className="flex space-x-2">
        <Button 
          variant={cycleFilter === 'all' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCycleFilter('all')}
        >
          All Cycles
        </Button>
        <Button 
          variant={cycleFilter === 'yearly' ? "default" : "outline"} 
          size="sm"
          onClick={() => setCycleFilter('yearly')}
          className={cycleFilter === 'yearly' ? "" : ""}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Yearly
          {groupedCycles.yearly.length > 0 && (
            <span className="ml-1 text-xs bg-primary-foreground text-primary rounded-full px-2">
              {groupedCycles.yearly.length}
            </span>
          )}
        </Button>
        <Button 
          variant={cycleFilter === 'quarterly' ? "default" : "outline"} 
          size="sm"
          onClick={() => setCycleFilter('quarterly')}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Quarterly
          {groupedCycles.quarterly.length > 0 && (
            <span className="ml-1 text-xs bg-primary-foreground text-primary rounded-full px-2">
              {groupedCycles.quarterly.length}
            </span>
          )}
        </Button>
        <Button 
          variant={cycleFilter === 'monthly' ? "default" : "outline"} 
          size="sm"
          onClick={() => setCycleFilter('monthly')}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Monthly
          {groupedCycles.monthly.length > 0 && (
            <span className="ml-1 text-xs bg-primary-foreground text-primary rounded-full px-2">
              {groupedCycles.monthly.length}
            </span>
          )}
        </Button>
      </div>
      
      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error ? error.message : 'An error occurred while loading OKR cycles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="min-h-[600px]">
          <div className="p-2">
            {viewMode === 'timeline' ? (
              <CycleTimeline cycles={filteredCycles} isLoading={isLoading} />
            ) : (
              <CyclesGrid cycles={filteredCycles} isLoading={isLoading} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOKRCycles;
