
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Grid, List, Clock } from "lucide-react";
import { format } from 'date-fns';
import { CyclesGrid } from '@/components/okr/cycles/CyclesGrid';
import { CycleTimeline } from '@/components/okr/cycles/CycleTimeline';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';

const AdminOKRCycles = () => {
  const { cycles, isLoading, error } = useOKRCycles();
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Filter for active cycle
  const activeCycle = cycles?.find(cycle => cycle.status === 'active');
  
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
        <div>
          {viewMode === 'timeline' ? (
            <CycleTimeline cycles={cycles || []} isLoading={isLoading} />
          ) : (
            <CyclesGrid cycles={cycles || []} isLoading={isLoading} />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOKRCycles;
