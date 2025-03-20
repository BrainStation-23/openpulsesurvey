
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus,
  Edit, 
  Trash2 
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
import { Objective, ObjectiveStatus } from '@/types/okr';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const AdminObjectiveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  
  const { 
    objective, 
    isLoading, 
    error, 
    updateStatus 
  } = useObjective(id);

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

  const handleUpdateStatus = (newStatus: ObjectiveStatus) => {
    updateStatus.mutate({ status: newStatus }, {
      onSuccess: () => {
        toast({
          title: "Status updated",
          description: `Objective status changed to ${newStatus.replace('_', ' ')}`
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin/okrs/objectives">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Objective Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsKeyResultDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Key Result
          </Button>
        </div>
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
            <CardFooter className="border-t pt-6 flex justify-between">
              <div className="flex gap-2">
                <h3 className="text-sm font-medium">Status:</h3>
                <select 
                  value={objective.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as ObjectiveStatus)}
                  className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_track">On Track</option>
                  <option value="at_risk">At Risk</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardFooter>
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

export default AdminObjectiveDetails;
