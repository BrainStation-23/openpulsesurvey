
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ObjectiveStatusBadge } from './ObjectiveStatusBadge';
import { ObjectiveWithRelations, KeyResult, ProgressCalculationMethod } from '@/types/okr';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Calculator, ExternalLink } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { updateProgressCalculationMethod } = useObjective(objective.id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const visibilityColor = {
    'private': 'bg-yellow-100 text-yellow-800',
    'team': 'bg-blue-100 text-blue-800',
    'department': 'bg-purple-100 text-purple-800',
    'organization': 'bg-green-100 text-green-800'
  };
  
  const approvalStatusColor = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'requested_changes': 'bg-orange-100 text-orange-800'
  };
  
  const methodLabel = {
    'weighted_sum': 'Weighted Sum',
    'weighted_avg': 'Weighted Average'
  };

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

  const handleMethodChange = (value: string) => {
    updateProgressCalculationMethod.mutate(
      { method: value as ProgressCalculationMethod },
      {
        onSuccess: () => {
          setIsEditingMethod(false);
          // We don't need to manually trigger recalculation here since
          // the useObjective hook will handle it automatically
        }
      }
    );
  };

  const handleManualRecalculate = async () => {
    if (!objective.id) return;
    
    setIsRecalculating(true);
    try {
      // Call the RPC function to recalculate the objective's progress
      const { error } = await supabase.rpc('calculate_cascaded_objective_progress', { 
        p_objective_id: objective.id 
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['objective', objective.id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      
      toast({
        title: 'Success',
        description: 'Progress recalculated successfully',
      });
    } catch (error) {
      console.error('Error recalculating progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to recalculate progress',
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleNavigateToCycle = () => {
    if (objective.cycleId) {
      navigate(`/${isAdmin ? 'admin' : 'user'}/okrs/cycles/${objective.cycleId}`);
    }
  };

  const handleNavigateToSBU = () => {
    if (objective.sbuId) {
      navigate(`/${isAdmin ? 'admin' : 'user'}/okrs/sbus/${objective.sbuId}`);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Progress</h3>
              <span className="font-medium">{objective.progress.toFixed(2)}%</span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Visibility</h3>
              <Badge className={visibilityColor[objective.visibility]}>
                {objective.visibility.charAt(0).toUpperCase() + objective.visibility.slice(1)}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Approval Status</h3>
              <Badge className={approvalStatusColor[objective.approvalStatus]}>
                {objective.approvalStatus.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Progress Calculation Method</h3>
              <div className="flex items-center gap-2">
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
                        size="sm" 
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={handleManualRecalculate}
                        disabled={isRecalculating}
                      >
                        <Calculator className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-semibold">Calculation Method Explained:</p>
                        <p><strong>Weighted Sum:</strong> Sum(progress * weight) / Sum(weight)</p>
                        <p><strong>Weighted Average:</strong> Average of (progress * weight) values</p>
                        <p className="mt-2 text-xs text-muted-foreground italic">Click to recalculate progress</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
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

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Relationships</h3>

            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">OKR Cycle</h4>
              <Button 
                variant="link" 
                className="flex items-center p-0 h-auto text-primary"
                onClick={handleNavigateToCycle}
              >
                View Cycle <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {objective.sbuId && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">Business Unit</h4>
                <Button 
                  variant="link" 
                  className="flex items-center p-0 h-auto text-primary"
                  onClick={handleNavigateToSBU}
                >
                  View SBU <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
