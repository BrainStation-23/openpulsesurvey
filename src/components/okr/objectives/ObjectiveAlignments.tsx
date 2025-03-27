
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useObjectiveAlignments } from '@/hooks/okr/useObjectiveAlignments';
import { ObjectiveVisibilityBadge } from './ObjectiveVisibilityBadge';
import { ObjectiveProgress } from './ObjectiveProgress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateAlignmentDialog } from '@/components/okr/alignments/CreateAlignmentDialog';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';

interface ObjectiveAlignmentsProps {
  objectiveId: string;
}

export const ObjectiveAlignments: React.FC<ObjectiveAlignmentsProps> = ({ objectiveId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { sourceAlignments, targetAlignments, isLoading, deleteAlignment } = useObjectiveAlignments(objectiveId);
  const { isAdmin, canCreateAlignments, isLoading: isPermissionLoading } = useOkrPermissions();
  const [canCreateAlignment, setCanCreateAlignment] = React.useState(false);

  React.useEffect(() => {
    const checkPermission = async () => {
      const isAdminResult = await isAdmin();
      const canCreateAlignmentsResult = await canCreateAlignments();
      setCanCreateAlignment(isAdminResult || canCreateAlignmentsResult);
    };
    
    checkPermission();
  }, [isAdmin, canCreateAlignments]);

  const getAlignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'parent_child': return { label: 'Parent-Child', variant: 'default' as const };
      case 'peer': return { label: 'Peer', variant: 'secondary' as const };
      case 'strategic': return { label: 'Strategic', variant: 'outline' as const };
      default: return { label: 'Unknown', variant: 'outline' as const };
    }
  };

  if (isLoading || isPermissionLoading) {
    return <div className="p-4 text-center">Loading alignments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Objective Alignments</h3>
        {canCreateAlignment && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Alignment
          </Button>
        )}
      </div>

      {sourceAlignments.length === 0 && targetAlignments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No alignments found for this objective.
          </CardContent>
        </Card>
      ) : (
        <>
          {sourceAlignments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  This objective supports:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {sourceAlignments.map((alignment) => (
                    <li key={alignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={alignment.alignedObjective?.owner_avatar_url} />
                            <AvatarFallback>{getInitials(alignment.alignedObjective?.owner_name || 'Unknown')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {alignment.alignedObjective?.owner_name || 'Unknown'}
                          </span>
                          <Badge variant={getAlignmentTypeLabel(alignment.alignment_type).variant}>
                            {getAlignmentTypeLabel(alignment.alignment_type).label}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAlignment.mutate(alignment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <h4 className="font-medium mb-2">{alignment.alignedObjective?.title}</h4>
                      {alignment.alignedObjective?.description && (
                        <p className="text-sm text-muted-foreground mb-2">{alignment.alignedObjective.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <ObjectiveVisibilityBadge visibility={alignment.alignedObjective?.visibility} />
                        <ObjectiveProgress progress={alignment.alignedObjective?.progress || 0} className="w-1/3" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {targetAlignments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  This objective is supported by:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {targetAlignments.map((alignment) => (
                    <li key={alignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={alignment.sourceObjective?.owner_avatar_url} />
                            <AvatarFallback>{getInitials(alignment.sourceObjective?.owner_name || 'Unknown')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {alignment.sourceObjective?.owner_name || 'Unknown'}
                          </span>
                          <Badge variant={getAlignmentTypeLabel(alignment.alignment_type).variant}>
                            {getAlignmentTypeLabel(alignment.alignment_type).label}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAlignment.mutate(alignment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <h4 className="font-medium mb-2">{alignment.sourceObjective?.title}</h4>
                      {alignment.sourceObjective?.description && (
                        <p className="text-sm text-muted-foreground mb-2">{alignment.sourceObjective.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <ObjectiveVisibilityBadge visibility={alignment.sourceObjective?.visibility} />
                        <ObjectiveProgress progress={alignment.sourceObjective?.progress || 0} className="w-1/3" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Objective Alignment</DialogTitle>
          </DialogHeader>
          <CreateAlignmentDialog 
            objectiveId={objectiveId}
            onSuccess={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
