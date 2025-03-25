
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OKRCycle } from '@/types/okr';

interface CycleCardProps {
  cycle: OKRCycle;
}

const getCycleStatusColor = (status: string) => {
  switch (status) {
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

export const CycleCard = ({ cycle }: CycleCardProps) => {
  const isActive = cycle.status === 'active';
  const timeRemaining = isActive ? 
    `Ends ${formatDistanceToNow(cycle.endDate, { addSuffix: true })}` : 
    `Starts ${formatDistanceToNow(cycle.startDate, { addSuffix: true })}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{cycle.name}</CardTitle>
          <Badge className={getCycleStatusColor(cycle.status)}>
            {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {cycle.description && (
          <p className="text-sm text-muted-foreground mb-4">{cycle.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-4 w-4" />
            <span>
              {format(cycle.startDate, 'MMM d, yyyy')} - {format(cycle.endDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4" />
            <span>{timeRemaining}</span>
          </div>
          {isActive && (
            <div className="flex items-center text-sm text-orange-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>Active cycle</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/admin/okrs/cycles/${cycle.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
