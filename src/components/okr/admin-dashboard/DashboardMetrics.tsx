
import React from 'react';
import { CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Objective, OKRCycle } from '@/types/okr';
import { format } from 'date-fns';
import { MetricCard } from './MetricCard';

interface DashboardMetricsProps {
  activeCycle: OKRCycle | undefined;
  cycleObjectives: Objective[];
  cyclesLoading: boolean;
  objectivesLoading: boolean;
}

export const DashboardMetrics = ({ 
  activeCycle, 
  cycleObjectives, 
  cyclesLoading, 
  objectivesLoading 
}: DashboardMetricsProps) => {
  const completionRate = calculateCompletionRate(cycleObjectives);
  const statusCounts = getStatusCounts(cycleObjectives);
  const atRiskCount = statusCounts['at_risk'] || 0;
  const completedCount = statusCounts['completed'] || 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Cycle"
        value={activeCycle ? activeCycle.name : "None"}
        description={activeCycle ? `${format(new Date(activeCycle.startDate), 'PP')} - ${format(new Date(activeCycle.endDate), 'PP')}` : "No active cycle"}
        icon={CalendarIcon}
        loading={cyclesLoading}
      />
      <MetricCard
        title="Completion Rate"
        value={`${completionRate}%`}
        description="Objectives completed"
        icon={CheckCircle}
        loading={objectivesLoading}
      />
      <MetricCard
        title="At Risk"
        value={atRiskCount.toString()}
        description="Objectives at risk"
        icon={AlertCircle}
        loading={objectivesLoading}
        valueClassName="text-destructive"
      />
      <MetricCard
        title="Completed"
        value={completedCount.toString()}
        description="Objectives completed"
        icon={CheckCircle}
        loading={objectivesLoading}
        valueClassName="text-green-500"
      />
    </div>
  );
};

// Helper functions
export const getStatusCounts = (objectives: Objective[]) => {
  return objectives.reduce((acc, obj) => {
    acc[obj.status] = (acc[obj.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const calculateCompletionRate = (objectives: Objective[]) => {
  if (objectives.length === 0) return 0;
  
  const completedCount = objectives.filter(obj => obj.status === 'completed').length;
  return Math.round((completedCount / objectives.length) * 100);
};
