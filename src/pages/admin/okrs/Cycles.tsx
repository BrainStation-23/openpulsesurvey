
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Grid, List, Calendar, Clock } from "lucide-react";
import { CyclesGrid } from '@/components/okr/cycles/CyclesGrid';
import { CycleTimeline } from '@/components/okr/cycles/CycleTimeline';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { CyclesErrorBoundary } from '@/components/okr/cycles/CyclesErrorBoundary';
import { formatCycleDate, getCycleType } from '@/utils/cycleUtils';
import type { OKRCycle } from '@/types/okr';

const AdminOKRCycles = () => {
  const { cycles, isLoading, error } = useOKRCycles();
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [cycleFilter, setCycleFilter] = useState<'all' | 'yearly' | 'quarterly' | 'monthly'>('all');

  // Memoize active cycle
  const activeCycle = useMemo(() => 
    cycles?.find(cycle => cycle.status === 'active'),
    [cycles]
  );

  // Memoize grouped cycles
  const groupedCycles = useMemo(() => {
    if (!cycles) return { yearly: [], quarterly: [], monthly: [] };
    
    return cycles.reduce((acc: Record<string, OKRCycle[]>, cycle) => {
      const cycleType = getCycleType(
        new Date(cycle.startDate), 
        new Date(cycle.endDate)
      ).toLowerCase() as 'yearly' | 'quarterly' | 'monthly';
      
      acc[cycleType] = [...(acc[cycleType] || []), cycle];
      return acc;
    }, { yearly: [], quarterly: [], monthly: [] });
  }, [cycles]);

  // Memoize filtered cycles
  const filteredCycles = useMemo(() => {
    if (cycleFilter === 'all') return cycles || [];
    return cycles?.filter(cycle => {
      const cycleType = getCycleType(
        new Date(cycle.startDate), 
        new Date(cycle.endDate)
      ).toLowerCase();
      return cycleType === cycleFilter;
    }) || [];
  }, [cycles, cycleFilter]);

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : 'An error occurred while loading OKR cycles'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <CyclesErrorBoundary>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">OKR Cycles</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('timeline')} 
              className={viewMode === 'timeline' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
              <List className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
            >
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

        {/* Active Cycle Card */}
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
                    {formatCycleDate(new Date(activeCycle.startDate))}
                    - {formatCycleDate(new Date(activeCycle.endDate))}
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
        
        {/* Cycles Display */}
        <div className="min-h-[600px]">
          <div className="p-2">
            {viewMode === 'timeline' ? (
              <CycleTimeline cycles={filteredCycles} isLoading={isLoading} />
            ) : (
              <CyclesGrid cycles={filteredCycles} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </CyclesErrorBoundary>
  );
};

export default AdminOKRCycles;
