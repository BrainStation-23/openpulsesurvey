
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ObjectiveAlignment, Objective } from '@/types/okr';
import { useObjectiveWithRelations } from '@/hooks/okr/useObjectiveWithRelations';
import { ExternalLink, ArrowRightLeft } from 'lucide-react';

interface AlignedObjectiveProps {
  alignment: ObjectiveAlignment;
  isSource: boolean;
  isAdmin?: boolean;
}

const AlignedObjectiveCard: React.FC<AlignedObjectiveProps> = ({ 
  alignment, 
  isSource,
  isAdmin = false
}) => {
  const objective = isSource ? alignment.alignedObjective : alignment.sourceObjective;
  const basePath = isAdmin ? '/admin' : '/user';
  
  if (!objective) return null;

  return (
    <div className="border rounded-md p-3 mb-3 hover:bg-muted/20 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isSource ? 'Supports' : 'Supported by'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {alignment.alignmentType.replace('_', ' ')}
            </Badge>
          </div>
          <Link 
            to={`${basePath}/okrs/objectives/${objective.id}`} 
            className="font-medium hover:underline flex items-center mt-1"
          >
            {objective.title}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <ObjectiveStatusBadge status={objective.status} />
      </div>
      
      {objective.description && (
        <p className="text-sm text-muted-foreground mb-2 truncate max-w-md">{objective.description}</p>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">Progress: {Math.round(objective.progress)}%</span>
        </div>
        <Progress value={objective.progress} className="h-1" />
      </div>
    </div>
  );
};

interface AlignedObjectivesViewProps {
  objectiveId: string;
  isAdmin?: boolean;
}

export const AlignedObjectivesView: React.FC<AlignedObjectivesViewProps> = ({ 
  objectiveId,
  isAdmin = false
}) => {
  const { objective, isLoading, error } = useObjectiveWithRelations(objectiveId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Aligned Objectives</h2>
          <div className="animate-pulse">
            <div className="h-24 bg-muted rounded-md mb-3"></div>
            <div className="h-24 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !objective) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Aligned Objectives</h2>
          <p className="text-muted-foreground">Error loading alignments.</p>
        </CardContent>
      </Card>
    );
  }
  
  const alignments = objective.alignedObjectives || [];
  
  // Split alignments into those where this objective is the source 
  // and those where it's the target
  const sourceAlignments = alignments.filter(a => a.sourceObjectiveId === objectiveId);
  const targetAlignments = alignments.filter(a => a.alignedObjectiveId === objectiveId);
  
  const hasAlignments = sourceAlignments.length > 0 || targetAlignments.length > 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold">Aligned Objectives</h2>
          <ArrowRightLeft className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
        
        {!hasAlignments ? (
          <p className="text-muted-foreground">No aligned objectives found.</p>
        ) : (
          <div className="space-y-4">
            {targetAlignments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Supporting Objectives</h3>
                {targetAlignments.map(alignment => (
                  <AlignedObjectiveCard 
                    key={alignment.id}
                    alignment={alignment}
                    isSource={false}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
            
            {sourceAlignments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Supported Objectives</h3>
                {sourceAlignments.map(alignment => (
                  <AlignedObjectiveCard 
                    key={alignment.id}
                    alignment={alignment}
                    isSource={true}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
