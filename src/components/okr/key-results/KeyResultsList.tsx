
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useKeyResults } from '@/hooks/okr/useKeyResults';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Check, AlertTriangle, Clock } from 'lucide-react';

interface KeyResultsListProps {
  objectiveId: string;
}

export const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading } = useKeyResults(objectiveId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'not_started':
        return <Clock className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Key Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : keyResults && keyResults.length > 0 ? (
          <div className="space-y-4">
            {keyResults.map((kr) => (
              <div 
                key={kr.id} 
                className="border rounded-md p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(kr.status)}
                    <h3 className="font-medium">{kr.title}</h3>
                  </div>
                  <Badge variant="outline">{kr.status.replace('_', ' ')}</Badge>
                </div>
                
                {kr.description && (
                  <p className="text-sm text-muted-foreground mb-2">{kr.description}</p>
                )}
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{kr.progress}%</span>
                  </div>
                  <Progress value={kr.progress} className="h-1.5" />
                </div>
                
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div>
                    {kr.unit && (
                      <span className="text-muted-foreground">
                        {kr.startValue} → {kr.currentValue} → {kr.targetValue} {kr.unit}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Check-in</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex justify-center mb-2">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No key results yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add key results to track progress toward this objective
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
