
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyResult, ObjectiveWithRelations } from '@/types/okr';

interface StatsCardProps {
  keyResults: KeyResult[];
  objective: ObjectiveWithRelations;
}

export const StatsCard: React.FC<StatsCardProps> = ({ keyResults, objective }) => {
  const calculateTotalWeight = () => {
    if (keyResults && keyResults.length > 0) {
      return keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);
    }
    
    if (objective.alignedObjectives && objective.alignedObjectives.length > 0) {
      const childAlignments = objective.alignedObjectives.filter(
        alignment => alignment.sourceObjectiveId === objective.id && alignment.alignmentType === 'parent_child'
      );
      
      return childAlignments.reduce((sum, alignment) => sum + (alignment.weight || 0), 0);
    }
    
    return 0;
  };

  const isUnderweighted = () => {
    const totalWeight = calculateTotalWeight();
    return totalWeight > 0 && totalWeight < 1.0;
  };

  const getCompletedCount = (items: any[], statusField = 'status') => {
    return items.filter(item => item[statusField] === 'completed').length;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Key Results</h3>
          <div className="flex items-center">
            <span className="font-medium">{getCompletedCount(keyResults)} / {keyResults.length} completed</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Child Objectives</h3>
          <div className="flex items-center">
            <span className="font-medium">
              {getCompletedCount(objective.childObjectives || [])} / {(objective.childObjectives || []).length} completed
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Weight</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">{calculateTotalWeight().toFixed(2)}</span>
            {isUnderweighted() && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                Underweighted
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
