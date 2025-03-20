
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ObjectiveStatusBadge } from './ObjectiveStatusBadge';
import { Objective } from '@/types/okr';

interface ObjectiveCardProps {
  objective: Objective;
  isAdmin?: boolean;
}

export const ObjectiveCard = ({ objective, isAdmin = false }: ObjectiveCardProps) => {
  const basePath = isAdmin ? '/admin/okrs/objectives' : '/user/okrs/objectives';
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold line-clamp-2">
            {objective.title}
          </CardTitle>
        </div>
        <ObjectiveStatusBadge status={objective.status} />
      </CardHeader>
      <CardContent>
        {objective.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {objective.description}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{objective.progress}%</span>
          </div>
          <Progress value={objective.progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-2">
        <Link 
          to={`${basePath}/${objective.id}`}
          className="text-sm text-primary hover:underline"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
};
