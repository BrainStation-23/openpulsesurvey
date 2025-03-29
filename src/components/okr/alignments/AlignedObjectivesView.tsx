
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ObjectiveAlignment, Objective } from '@/types/okr';
import { useObjectiveWithRelations } from '@/hooks/okr/useObjectiveWithRelations';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { ExternalLink, ArrowRightLeft, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditAlignmentDialog } from './EditAlignmentDialog';

interface AlignedObjectiveProps {
  alignment: ObjectiveAlignment;
  isSource: boolean;
  isAdmin?: boolean;
  canEdit?: boolean;
  onRemove: (alignmentId: string) => void;
  onEdit: (alignment: ObjectiveAlignment) => void;
}

const AlignedObjectiveCard: React.FC<AlignedObjectiveProps> = ({ 
  alignment, 
  isSource,
  isAdmin = false,
  canEdit = false,
  onRemove,
  onEdit
}) => {
  const objective = isSource ? alignment.alignedObjective : alignment.sourceObjective;
  const basePath = isAdmin ? '/admin' : '/user';
  
  if (!objective) return null;

  return (
    <div className="border rounded-md p-4 mb-3 hover:bg-muted/20 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0 flex-grow">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {isSource ? 'Supports' : 'Supported by'}
            </Badge>
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {alignment.alignmentType.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              Weight: {alignment.weight}
            </Badge>
          </div>
          <Link 
            to={`${basePath}/okrs/objectives/${objective.id}`} 
            className="font-medium hover:underline flex items-center mt-1 break-words"
          >
            {objective.title}
            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </Link>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <ObjectiveStatusBadge status={objective.status} />
          {canEdit && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-blue-500 hover:bg-blue-50"
                onClick={() => onEdit(alignment)}
                title="Edit alignment"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(alignment.id)}
                title="Delete alignment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {objective.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{objective.description}</p>
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
  canEdit?: boolean;
}

export const AlignedObjectivesView: React.FC<AlignedObjectivesViewProps> = ({ 
  objectiveId,
  isAdmin = false,
  canEdit = false
}) => {
  const { objective, isLoading, error } = useObjectiveWithRelations(objectiveId);
  const { deleteAlignment } = useAlignments(objectiveId);
  const [alignmentToDelete, setAlignmentToDelete] = React.useState<string | null>(null);
  const [alignmentToEdit, setAlignmentToEdit] = React.useState<ObjectiveAlignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  const handleRemoveAlignment = (alignmentId: string) => {
    setAlignmentToDelete(alignmentId);
  };

  const handleEditAlignment = (alignment: ObjectiveAlignment) => {
    setAlignmentToEdit(alignment);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (alignmentToDelete) {
      deleteAlignment.mutate(alignmentToDelete);
      setAlignmentToDelete(null);
    }
  };
  
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
                    canEdit={canEdit}
                    onRemove={handleRemoveAlignment}
                    onEdit={handleEditAlignment}
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
                    canEdit={canEdit}
                    onRemove={handleRemoveAlignment}
                    onEdit={handleEditAlignment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <AlertDialog open={!!alignmentToDelete} onOpenChange={(open) => !open && setAlignmentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Alignment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this alignment? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <EditAlignmentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          alignment={alignmentToEdit}
          onSuccess={() => setAlignmentToEdit(null)}
        />
      </CardContent>
    </Card>
  );
};
