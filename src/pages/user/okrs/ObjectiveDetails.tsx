
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useObjective } from '@/hooks/okr/useObjective';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ObjectiveStatus } from '@/types/okr';

const UserObjectiveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    objective, 
    isLoading, 
    error,
    updateStatus 
  } = useObjective(id);
  
  const handleStatusUpdate = (status: ObjectiveStatus) => {
    if (!id) return;
    
    updateStatus.mutate({ 
      status
    });
  };
  
  const handleBack = () => {
    navigate('/user/okrs/objectives');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !objective) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Objective Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <Info className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-medium">The requested objective could not be found</h2>
              <p className="text-muted-foreground">
                The objective may have been deleted or you may not have permission to view it.
              </p>
              <Button onClick={handleBack}>Return to Objectives</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Objective Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{objective.title}</CardTitle>
              {objective.description && (
                <CardDescription className="mt-2">{objective.description}</CardDescription>
              )}
            </div>
            <ObjectiveStatusBadge status={objective.status} className="ml-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <dt className="font-medium">Progress</dt>
                  <dd className="text-right">
                    <div className="flex items-center">
                      <div className="w-32 bg-muted rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${objective.progress || 0}%` }}
                        />
                      </div>
                      <span>{objective.progress?.toFixed(0) || 0}%</span>
                    </div>
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <dt className="font-medium">Visibility</dt>
                  <dd className="text-right">
                    <Badge variant="outline">
                      {objective.visibility.charAt(0).toUpperCase() + objective.visibility.slice(1).replace('_', ' ')}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Relationships</h3>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <dt className="font-medium">OKR Cycle</dt>
                  <dd className="text-right">
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/user/okrs/dashboard?cycleId=${objective.cycleId}`)}>
                      View Cycle
                    </Button>
                  </dd>
                </div>
                {objective.parentObjectiveId && (
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Parent Objective</dt>
                    <dd className="text-right">
                      <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/user/okrs/objectives/${objective.parentObjectiveId}`)}>
                        View Parent
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Only show status update if user is the owner of the objective */}
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={objective.status === 'draft' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusUpdate('draft')}
              >
                Draft
              </Button>
              <Button 
                variant={objective.status === 'in_progress' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusUpdate('in_progress')}
              >
                In Progress
              </Button>
              <Button 
                variant={objective.status === 'at_risk' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusUpdate('at_risk')}
              >
                At Risk
              </Button>
              <Button 
                variant={objective.status === 'on_track' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusUpdate('on_track')}
              >
                On Track
              </Button>
              <Button 
                variant={objective.status === 'completed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
              >
                <Check className="h-4 w-4 mr-2" />
                Completed
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Key Results</h3>
            {/* Key Results will be added later */}
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No key results associated with this objective yet.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-0">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(objective.updatedAt).toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserObjectiveDetails;
