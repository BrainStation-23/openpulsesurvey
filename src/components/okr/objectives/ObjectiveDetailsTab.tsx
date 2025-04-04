
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ObjectiveStatusBadge } from './ObjectiveStatusBadge';
import { ObjectiveWithRelations, KeyResult, ProgressCalculationMethod } from '@/types/okr';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Calculator } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useObjective } from '@/hooks/okr/useObjective';

interface ObjectiveDetailsTabProps {
  objective: ObjectiveWithRelations;
  keyResults: KeyResult[];
  isAdmin?: boolean;
  canEditObjective?: boolean;
}

export const ObjectiveDetailsTab: React.FC<ObjectiveDetailsTabProps> = ({
  objective,
  keyResults,
  isAdmin = false,
  canEditObjective = false
}) => {
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const { updateProgressCalculationMethod } = useObjective(objective.id);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const statusColor = {
    'draft': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'at_risk': 'bg-red-100 text-red-800',
    'on_track': 'bg-green-100 text-green-800',
    'completed': 'bg-purple-100 text-purple-800'
  };
  
  const visibilityColor = {
    'private': 'bg-yellow-100 text-yellow-800',
    'team': 'bg-blue-100 text-blue-800',
    'department': 'bg-purple-100 text-purple-800',
    'organization': 'bg-green-100 text-green-800'
  };
  
  const methodLabel = {
    'weighted_sum': 'Weighted Sum',
    'weighted_avg': 'Weighted Average'
  };

  const calculateProgress = (method: ProgressCalculationMethod, keyResults: KeyResult[]) => {
    if (keyResults.length === 0) return 0;
    
    if (method === 'weighted_sum') {
      const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 1), 0);
      const weightedSum = keyResults.reduce((sum, kr) => sum + (kr.progress * (kr.weight || 1)), 0);
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    } else { // weighted_avg
      return keyResults.reduce((sum, kr) => sum + (kr.progress * (kr.weight || 1)), 0) / keyResults.length;
    }
  };
  
  const handleMethodChange = (value: string) => {
    updateProgressCalculationMethod.mutate(
      { method: value as ProgressCalculationMethod },
      {
        onSuccess: () => setIsEditingMethod(false)
      }
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Objective Details</h3>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Title</span>
                <p className="mt-1">{objective.title}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <div className="mt-1">
                  <ObjectiveStatusBadge status={objective.status} />
                </div>
              </div>
              
              <div className="col-span-2">
                <span className="text-sm font-medium text-gray-500">Description</span>
                <p className="mt-1">{objective.description || 'No description provided'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Visibility</span>
                <div className="mt-1">
                  <Badge className={visibilityColor[objective.visibility]}>
                    {objective.visibility.charAt(0).toUpperCase() + objective.visibility.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Progress Calculation Method</span>
                <div className="mt-1 flex items-center gap-2">
                  {isEditingMethod ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        defaultValue={objective.progressCalculationMethod || 'weighted_sum'} 
                        onValueChange={handleMethodChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weighted_sum">Weighted Sum</SelectItem>
                          <SelectItem value="weighted_avg">Weighted Average</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingMethod(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge className="bg-blue-100 text-blue-800">
                        {methodLabel[objective.progressCalculationMethod as ProgressCalculationMethod || 'weighted_sum']}
                      </Badge>
                      {canEditObjective && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => setIsEditingMethod(true)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Calculator className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold">Calculation Method Explained:</p>
                          <p><strong>Weighted Sum:</strong> Sum(progress * weight) / Sum(weight)</p>
                          <p><strong>Weighted Average:</strong> Average of (progress * weight) values</p>
                          <div className="pt-2 border-t">
                            <p className="font-semibold">Current Progress Calculation:</p>
                            <p>
                              Current Method: {methodLabel[objective.progressCalculationMethod as ProgressCalculationMethod || 'weighted_sum']}
                              <br />
                              Progress: {objective.progress.toFixed(1)}%
                              <br />
                              Alternate Method: {methodLabel[(objective.progressCalculationMethod === 'weighted_sum' ? 'weighted_avg' : 'weighted_sum') as ProgressCalculationMethod]}
                              <br />
                              Alternate Progress: {calculateProgress(
                                objective.progressCalculationMethod === 'weighted_sum' ? 'weighted_avg' : 'weighted_sum',
                                keyResults
                              ).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Progress</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Overall Progress</span>
                <span className="font-medium">{objective.progress.toFixed(1)}%</span>
              </div>
              <Progress value={objective.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional sections for related data can be added here */}
    </div>
  );
};
