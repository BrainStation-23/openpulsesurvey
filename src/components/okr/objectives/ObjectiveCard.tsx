
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
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { User, ListChecks } from 'lucide-react';
import { useOwnerInfo } from '@/components/okr/key-results/hooks/useOwnerInfo';

interface ObjectiveCardProps {
  objective: Objective;
  isAdmin?: boolean;
  childCount?: number;
}

export const ObjectiveCard = ({ objective, isAdmin = false, childCount = 0 }: ObjectiveCardProps) => {
  const basePath = isAdmin ? '/admin/okrs/objectives' : '/user/okrs/objectives';
  const { data: keyResults, isLoading: isLoadingKeyResults } = useKeyResults(objective.id);
  const { ownerName } = useOwnerInfo(objective.ownerId);
  
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
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{objective.progress.toFixed(0)}%</span>
          </div>
          <Progress value={objective.progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>Owner: {ownerName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <ListChecks className="h-4 w-4 mr-2" />
              <span>Key Results: {isLoadingKeyResults ? '...' : keyResults?.length || 0}</span>
            </div>
            
            {childCount > 0 && (
              <div className="text-sm text-muted-foreground">
                <span>Child Objectives: {childCount}</span>
              </div>
            )}
          </div>
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
