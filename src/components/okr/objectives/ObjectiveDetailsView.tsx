
import React from 'react';
import { AlertTriangle, CalendarClock, List, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ObjectiveWithRelations, ObjectiveStatus } from '@/types/okr';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { useNavigate } from 'react-router-dom';

interface ObjectiveDetailsViewProps {
  objective: ObjectiveWithRelations;
  creatorName: string;
  keyResultsCount: number;
  completedKeyResults: number;
  isAdmin?: boolean;
}

export const ObjectiveDetailsView = ({
  objective,
  creatorName,
  keyResultsCount,
  completedKeyResults,
  isAdmin = false,
}: ObjectiveDetailsViewProps) => {
  const navigate = useNavigate();
  const basePath = isAdmin ? '/admin' : '/user';
  
  // Calculate child objectives data
  const childObjectivesCount = objective.childObjectives?.length || 0;
  const completedChildObjectives = objective.childObjectives?.filter(child => child.status === 'completed').length || 0;
  
  // Calculate weight information
  const childObjectivesTotalWeight = objective.alignedObjectives
    ?.filter(a => a.sourceObjectiveId === objective.id)
    ?.reduce((sum, alignment) => sum + alignment.weight, 0) || 0;
    
  const keyResultsTotalWeight = objective.keyResults?.reduce((sum, kr) => sum + (kr.weight || 0), 0) || 0;
  const totalWeight = (childObjectivesTotalWeight + keyResultsTotalWeight).toFixed(2);
  const isOverweighted = parseFloat(totalWeight) > 1;
  const isUnderweighted = parseFloat(totalWeight) < 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Objective Statistics
          </h3>
          <div className="bg-muted/50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <ObjectiveStatusBadge status={objective.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{objective.progress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key Results:</span>
              <span className="font-medium">{keyResultsCount} total ({completedKeyResults} completed)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visibility:</span>
              <Badge variant="outline" className="capitalize">
                {objective.visibility}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <List className="h-5 w-5 mr-2" />
            Alignment Information
          </h3>
          <div className="bg-muted/50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parent Objective:</span>
              <span className="font-medium">
                {objective.parentObjectiveId ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Child Objectives:</span>
              <span className="font-medium">
                {childObjectivesCount > 0 ? `${completedChildObjectives}/${childObjectivesCount} completed` : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Weight:</span>
              <div className="flex items-center">
                <span className={`font-medium ${isOverweighted ? 'text-destructive' : isUnderweighted ? 'text-amber-500' : 'text-green-600'}`}>
                  {totalWeight}
                </span>
                {isOverweighted && (
                  <span className="ml-2 text-destructive" title="Total weight exceeds 1.0">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                )}
                {isUnderweighted && (
                  <span className="ml-2 text-amber-500" title="Total weight is less than 1.0">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <CalendarClock className="h-5 w-5 mr-2" />
          Timeline
        </h3>
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground mb-1">Created At</div>
              <div className="font-medium">{new Date(objective.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Last Updated</div>
              <div className="font-medium">{new Date(objective.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <>
          {objective.childObjectives?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Child Objectives</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {objective.childObjectives.map((child) => {
                  const alignment = objective.alignedObjectives?.find(
                    a => a.alignedObjectiveId === child.id && a.sourceObjectiveId === objective.id
                  );
                  const weight = alignment?.weight || 0;
                  
                  return (
                    <div key={child.id} className="flex justify-between py-2 border-b items-center">
                      <div className="flex items-center space-x-2">
                        <List className="h-4 w-4 text-gray-500" />
                        <span>{child.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-mono">
                          Weight: {(weight * 100).toFixed(1)}%
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-muted rounded-full h-2 mr-2">
                            <div 
                              className={`rounded-full h-2 ${
                                child.status === 'completed' 
                                  ? 'bg-green-500' 
                                  : child.status === 'at_risk' 
                                  ? 'bg-red-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${child.progress}%` }}
                            />
                          </div>
                          <span>{child.progress}%</span>
                        </div>
                        <ObjectiveStatusBadge status={child.status} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`${basePath}/okrs/objectives/${child.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
