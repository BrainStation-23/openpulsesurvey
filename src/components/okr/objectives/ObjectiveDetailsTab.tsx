
import React from 'react';
import { List, Target, AlertTriangle, CalendarClock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ObjectiveWithRelations, KeyResult } from '@/types/okr';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { getDueDateColorClass, formatDueDate } from '@/components/okr/key-results/utils/dueDateUtils';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface ObjectiveDetailsTabProps {
  objective: ObjectiveWithRelations;
  keyResults: KeyResult[];
  isAdmin?: boolean;
}

export const ObjectiveDetailsTab: React.FC<ObjectiveDetailsTabProps> = ({
  objective,
  keyResults,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  const routePrefix = isAdmin ? '/admin' : '/user';
  
  // Calculate statistics
  const completedKeyResults = keyResults.filter(kr => kr.status === 'completed').length;
  
  // Get child objectives count and stats
  const childObjectivesCount = objective.childObjectives?.length || 0;
  const completedChildObjectives = objective.childObjectives?.filter(child => child.status === 'completed').length || 0;
  
  // Calculate total weight (key results + child objectives)
  const childObjectivesTotalWeight = objective.alignedObjectives
    ?.filter(a => a.sourceObjectiveId === objective.id)
    ?.reduce((sum, alignment) => sum + alignment.weight, 0) || 0;
    
  const keyResultsTotalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);
  const totalWeight = (childObjectivesTotalWeight + keyResultsTotalWeight).toFixed(2);
  const isOverweighted = parseFloat(totalWeight) > 1;
  const isUnderweighted = parseFloat(totalWeight) < 1;
  
  return (
    <div>
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
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                  <span>{objective.progress}%</span>
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
            <div className="flex justify-between py-1 border-b">
              <dt className="font-medium">Approval Status</dt>
              <dd className="text-right">
                <Badge variant={objective.approvalStatus === 'approved' ? 'success' : 'outline'}>
                  {objective.approvalStatus.charAt(0).toUpperCase() + objective.approvalStatus.slice(1).replace('_', ' ')}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b">
              <dt className="font-medium">Key Results</dt>
              <dd className="text-right">
                <Badge variant="outline" className="bg-blue-50">
                  {completedKeyResults} / {keyResults.length} completed
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b">
              <dt className="font-medium">Child Objectives</dt>
              <dd className="text-right">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {completedChildObjectives} / {childObjectivesCount} completed
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-1 border-b">
              <dt className="font-medium">Total Weight</dt>
              <dd className="flex items-center space-x-2">
                <span className={`font-mono ${isOverweighted ? 'text-red-600' : isUnderweighted ? 'text-yellow-600' : 'text-green-600'}`}>
                  {totalWeight}
                </span>
                {isOverweighted && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Overweighted</span>
                  </div>
                )}
                {isUnderweighted && !isOverweighted && (
                  <span className="text-xs text-yellow-600">Underweighted</span>
                )}
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
                <Button variant="link" className="h-auto p-0" onClick={() => navigate(`${routePrefix}/okrs/cycles/${objective.cycleId}`)}>
                  View Cycle
                </Button>
              </dd>
            </div>
            {objective.parentObjectiveId && (
              <div className="flex justify-between py-1 border-b">
                <dt className="font-medium">Parent Objective</dt>
                <dd className="text-right">
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate(`${routePrefix}/okrs/objectives/${objective.parentObjectiveId}`)}>
                    View Parent
                  </Button>
                </dd>
              </div>
            )}
            {objective.sbuId && (
              <div className="flex justify-between py-1 border-b">
                <dt className="font-medium">Business Unit</dt>
                <dd className="text-right">
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate(`${routePrefix === '/admin' ? '/admin/config' : '/user/company'}/sbus/${objective.sbuId}`)}>
                    View SBU
                  </Button>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {objective.childObjectives && objective.childObjectives.length > 0 && (
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
                      onClick={() => navigate(`${routePrefix}/okrs/objectives/${child.id}`)}
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

      {keyResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Results Summary</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {keyResults.map(kr => (
              <div key={kr.id} className="flex justify-between py-2 border-b items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span>{kr.title}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-mono">
                    Weight: {(kr.weight * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-muted rounded-full h-2 mr-2">
                      <div 
                        className={`rounded-full h-2 ${
                          kr.status === 'completed' 
                            ? 'bg-green-500' 
                            : kr.status === 'at_risk' 
                            ? 'bg-red-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${kr.progress}%` }}
                      />
                    </div>
                    <span>{kr.progress}%</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={kr.status === 'completed' ? 'bg-green-50 text-green-700' : ''}
                  >
                    {kr.status.replace('_', ' ')}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={
                      kr.krType === 'committed' ? 'bg-blue-50 text-blue-700' : 
                      kr.krType === 'aspirational' ? 'bg-purple-50 text-purple-700' : 
                      'bg-gray-50 text-gray-700'
                    }
                  >
                    {kr.krType.charAt(0).toUpperCase() + kr.krType.slice(1)}
                  </Badge>
                  {kr.dueDate && kr.status !== 'completed' && (
                    <Badge 
                      variant="outline"
                      className={`flex items-center gap-1 ${getDueDateColorClass(kr.dueDate)}`}
                    >
                      <CalendarClock className="h-3 w-3" />
                      <span>{formatDueDate(kr.dueDate)}</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
