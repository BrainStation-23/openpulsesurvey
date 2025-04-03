
import React from 'react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { CalendarClock, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { OKRCycle } from '@/types/okr';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { determineCycleType, getCycleColor } from '@/utils/cycleUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CycleTimelineProps {
  cycles: OKRCycle[];
  isLoading: boolean;
}

export const CycleTimeline: React.FC<CycleTimelineProps> = ({ cycles, isLoading }) => {
  const navigate = useNavigate();
  const now = new Date();

  // Sort cycles by start date
  const sortedCycles = [...(cycles || [])].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (!sortedCycles.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No OKR Cycles Found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first OKR cycle.
        </p>
        <Button onClick={() => navigate('/admin/okrs/cycles/create')}>
          Create First Cycle
        </Button>
      </div>
    );
  }

  const getCycleStatusColor = (cycle: OKRCycle) => {
    switch (cycle.status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCycleIcon = (cycle: OKRCycle) => {
    switch (cycle.status) {
      case 'active':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'upcoming':
        return <CalendarClock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case 'archived':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CalendarClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCycleTimeframe = (cycle: OKRCycle) => {
    return `${format(new Date(cycle.startDate), 'MMM d, yyyy')} - ${format(new Date(cycle.endDate), 'MMM d, yyyy')}`;
  };

  const getCycleTypeBadge = (cycle: OKRCycle) => {
    const cycleType = determineCycleType(new Date(cycle.startDate), new Date(cycle.endDate));
    const color = getCycleColor(cycleType);
    
    return (
      <Badge className={`bg-${color}-100 text-${color}-800 border border-${color}-200`}>
        {cycleType.charAt(0).toUpperCase() + cycleType.slice(1)}
      </Badge>
    );
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        <div className="relative">
          {/* Timeline track */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {sortedCycles.map((cycle) => {
            const isActive = cycle.status === 'active';
            const isPast = isBefore(new Date(cycle.endDate), now);
            const isFuture = isAfter(new Date(cycle.startDate), now);
            const isCurrent = isWithinInterval(now, {
              start: new Date(cycle.startDate),
              end: new Date(cycle.endDate)
            });
            
            const cycleType = determineCycleType(new Date(cycle.startDate), new Date(cycle.endDate));
            const typeColor = getCycleColor(cycleType);
            
            return (
              <div 
                key={cycle.id} 
                className={`relative flex items-start p-4 rounded-lg border ${
                  isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                } transition-all ml-12 cursor-pointer mb-4`}
                onClick={() => navigate(`/admin/okrs/cycles/${cycle.id}`)}
              >
                {/* Timeline node */}
                <div className={`absolute -left-12 mt-1 flex items-center justify-center w-6 h-6 rounded-full border-4 ${
                  isActive ? 'bg-green-100 border-green-500' : 
                  isPast ? 'bg-gray-100 border-gray-500' : 
                  `bg-${typeColor}-100 border-${typeColor}-500`
                }`}>
                </div>

                {/* Cycle icon */}
                <div className="mr-4 mt-1">{getCycleIcon(cycle)}</div>
                
                {/* Cycle content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{cycle.name}</h3>
                      <Badge className={`bg-${typeColor}-100 text-${typeColor}-800 border border-${typeColor}-200`}>
                        {cycleType.charAt(0).toUpperCase() + cycleType.slice(1)}
                      </Badge>
                    </div>
                    <Badge className={getCycleStatusColor(cycle)}>
                      {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{getCycleTimeframe(cycle)}</p>
                  
                  {cycle.description && (
                    <p className="mt-2 text-sm">{cycle.description}</p>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {isCurrent && "Current cycle"}
                      {isPast && "Past cycle"}
                      {isFuture && "Future cycle"}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};
