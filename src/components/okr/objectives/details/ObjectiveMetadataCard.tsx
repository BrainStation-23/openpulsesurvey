
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ProgressCalculationMethod } from '@/types/okr';
import { useObjectiveRecalculate } from '@/hooks/okr/useObjectiveRecalculate';

interface ObjectiveMetadataCardProps {
  visibility: string;
  approvalStatus: string;
  progressCalculationMethod: ProgressCalculationMethod | string;
  objectiveId: string;
  canEditObjective?: boolean;
  onMethodChange: (method: ProgressCalculationMethod) => void;
}

export const ObjectiveMetadataCard: React.FC<ObjectiveMetadataCardProps> = ({
  visibility,
  approvalStatus,
  progressCalculationMethod,
  objectiveId,
  canEditObjective = false,
  onMethodChange,
}) => {
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const { isRecalculating, recalculateProgress } = useObjectiveRecalculate(objectiveId);
  
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

  const handleMethodChange = (value: string) => {
    onMethodChange(value as ProgressCalculationMethod);
    setIsEditingMethod(false);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Visibility</h3>
          <Badge className={visibilityColor[visibility as keyof typeof visibilityColor]}>
            {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Approval Status</h3>
          <Badge className={approvalStatusColor[approvalStatus as keyof typeof approvalStatusColor]}>
            {approvalStatus.split('_').map(word => 
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
                  defaultValue={progressCalculationMethod || 'weighted_sum'} 
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
                  {methodLabel[progressCalculationMethod as keyof typeof methodLabel || 'weighted_sum']}
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
                    onClick={() => recalculateProgress()}
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
  );
};
