
import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { 
  CalendarClock, 
  Clock, 
  Calendar, 
  Users, 
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle
} from 'lucide-react';
import { OKRCycle } from '@/types/okr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { getCycleProgress } from '@/utils/cycleUtils';

interface CycleDetailHeaderProps {
  cycle: OKRCycle;
  objectiveCount?: number;
  completedObjectives?: number;
  onActivate?: () => void;
  onArchive?: () => void;
  isUpdating?: boolean;
}

export const CycleDetailHeader: React.FC<CycleDetailHeaderProps> = ({ 
  cycle, 
  objectiveCount = 0,
  completedObjectives = 0,
  onActivate,
  onArchive,
  isUpdating = false
}) => {
  const now = new Date();
  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);
  
  const isActive = cycle.status === 'active';
  const isCompleted = cycle.status === 'completed';
  const isUpcoming = cycle.status === 'upcoming';
  const isArchived = cycle.status === 'archived';
  
  const progress = getCycleProgress(startDate, endDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, now));
  const totalDays = differenceInDays(endDate, startDate);
  
  const objectiveProgress = objectiveCount > 0 
    ? Math.round((completedObjectives / objectiveCount) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`p-4 rounded-lg ${
        isActive ? 'bg-green-50 border border-green-200' : 
        isCompleted ? 'bg-gray-50 border border-gray-200' :
        isUpcoming ? 'bg-blue-50 border border-blue-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            {isActive && <Clock className="h-5 w-5 text-green-600 mr-2" />}
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-gray-600 mr-2" />}
            {isUpcoming && <Calendar className="h-5 w-5 text-blue-600 mr-2" />}
            {isArchived && <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />}
            <span className={`font-medium ${
              isActive ? 'text-green-600' : 
              isCompleted ? 'text-gray-600' :
              isUpcoming ? 'text-blue-600' :
              'text-yellow-600'
            }`}>
              {isActive && 'Active OKR Cycle'}
              {isCompleted && 'Completed OKR Cycle'}
              {isUpcoming && 'Upcoming OKR Cycle'}
              {isArchived && 'Archived OKR Cycle'}
            </span>
          </div>
          
          <div className="flex gap-2">
            {isUpcoming && (
              <Button 
                size="sm" 
                onClick={onActivate}
                disabled={isUpdating}
              >
                <ArrowUpCircle className="mr-1 h-4 w-4" />
                Activate Cycle
              </Button>
            )}
            
            {!isArchived && (
              <Button 
                variant="outline"
                size="sm" 
                onClick={onArchive}
                disabled={isUpdating}
              >
                Archive Cycle
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cycle details and progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {format(startDate, 'MMMM d, yyyy')} - {format(endDate, 'MMMM d, yyyy')}
                </span>
                <Badge variant="outline">{totalDays} days</Badge>
              </div>
              
              {!isCompleted && !isArchived && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {daysRemaining} days remaining
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex flex-col h-full justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <Target className="h-6 w-6 text-primary mb-1" />
                <div className="text-2xl font-bold">{objectiveCount}</div>
                <div className="text-xs text-muted-foreground text-center">
                  Objectives
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-1" />
                <div className="text-2xl font-bold">{completedObjectives}</div>
                <div className="text-xs text-muted-foreground text-center">
                  Completed
                </div>
              </div>
            </div>
            
            {objectiveCount > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Objective Progress</span>
                  <span>{objectiveProgress}%</span>
                </div>
                <Progress value={objectiveProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
