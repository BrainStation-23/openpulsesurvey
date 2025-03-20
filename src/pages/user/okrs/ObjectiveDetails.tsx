
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ObjectiveStatusBadge } from "@/components/okr/objectives/ObjectiveStatusBadge";
import { useObjective } from '@/hooks/okr/useObjective';
import { KeyResultsList } from '@/components/okr/key-results/KeyResultsList';
import { KeyResultDialog } from '@/components/okr/key-results/KeyResultDialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveStatus } from '@/types/okr';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const UserObjectiveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get the current user ID when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user?.id || null);
    };
    
    fetchCurrentUser();
  }, []);
  
  const { 
    objective, 
    isLoading, 
    error, 
    updateStatus 
  } = useObjective(id);

  const handleUpdateStatus = (newStatus: ObjectiveStatus) => {
    if (!objective) return;
    
    updateStatus.mutate({ status: newStatus }, {
      onSuccess: () => {
        toast({
          title: "Status updated",
          description: `Objective status changed to ${newStatus.replace('_', ' ')}`
        });
      }
    });
  };

  const handleOpenEditDialog = () => {
    // TODO: We'll implement this in another ticket
    toast({
      title: "Coming soon",
      description: "Edit functionality will be available soon",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h3 className="font-semibold">Error loading objective</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/user/okrs/objectives">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Objective Details</h1>
        </div>
        
        {objective && objective.ownerId === currentUserId && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsKeyResultDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Key Result
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ) : objective ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-2xl">{objective.title}</CardTitle>
                  <CardDescription>
                    Created on {format(new Date(objective.createdAt), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <ObjectiveStatusBadge status={objective.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {objective.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p>{objective.description}</p>
                </div>
              )}
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <h3 className="font-medium text-muted-foreground">Progress</h3>
                  <span>{objective.progress}%</span>
                </div>
                <Progress value={objective.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Visibility</h3>
                  <Badge variant="outline" className="capitalize">
                    {objective.visibility.replace('_', ' ')}
                  </Badge>
                </div>
                {objective.sbuId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                    <Badge variant="outline">Department info</Badge>
                  </div>
                )}
              </div>
            </CardContent>
            
            {objective.ownerId === currentUserId && (
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="flex gap-2 items-center">
                  <h3 className="text-sm font-medium">Status:</h3>
                  <Select 
                    value={objective.status} 
                    onValueChange={(value) => handleUpdateStatus(value as ObjectiveStatus)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_track">On Track</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenEditDialog}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          <KeyResultsList objectiveId={objective.id} />
          
          {isKeyResultDialogOpen && (
            <KeyResultDialog 
              objectiveId={objective.id}
              open={isKeyResultDialogOpen}
              onOpenChange={setIsKeyResultDialogOpen} 
            />
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">Objective not found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserObjectiveDetails;
