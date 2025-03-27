
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Edit, Users, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ObjectiveProgress } from '@/components/okr/objectives/ObjectiveProgress';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { ObjectiveVisibilityBadge } from '@/components/okr/objectives/ObjectiveVisibilityBadge';
import { ObjectiveAlignments } from '@/components/okr/objectives/ObjectiveAlignments';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreateAlignmentDialog } from '@/components/okr/alignments/CreateAlignmentDialog';
import { useObjective } from '@/hooks/okr/useObjective';
import { ObjectiveStatus, ObjectiveVisibility } from '@/types/okr';

export default function ObjectiveDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [isEditingAlignments, setIsEditingAlignments] = useState(false);
  const { toast } = useToast();
  const objectiveId = id || '';
  
  const {
    objective,
    isLoading,
    error,
    updateStatus,
    updateObjective
  } = useObjective(objectiveId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error.message}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard/okrs/objectives">Back to Objectives</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (status: ObjectiveStatus) => {
    updateStatus.mutate({ status });
  };

  const handleEditClick = () => {
    // Implement this if needed
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/okrs/objectives">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Objectives
          </Link>
        </Button>
        <Button size="sm" onClick={handleEditClick}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Objective
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{objective.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <ObjectiveStatusBadge status={objective.status} />
                <ObjectiveVisibilityBadge visibility={objective.visibility} />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {objective.cycle_name || 'No cycle'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {objective.owner_name || 'Unknown owner'}
                </Badge>
              </div>
            </div>
            <ObjectiveProgress progress={objective.progress || 0} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{objective.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="keyResults">
        <TabsList>
          <TabsTrigger value="keyResults">Key Results</TabsTrigger>
          <TabsTrigger value="alignments">Alignments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keyResults" className="py-4">
          <Card>
            <CardContent className="py-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Key Results</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key Result
                </Button>
              </div>
              
              <div className="text-center py-8 text-muted-foreground">
                No key results added yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alignments" className="py-4">
          <ObjectiveAlignments 
            objectiveId={objectiveId} 
            onCreateAlignment={() => setIsEditingAlignments(true)}
          />
          
          <CreateAlignmentDialog 
            isOpen={isEditingAlignments}
            onOpenChange={setIsEditingAlignments}
            sourceObjectiveId={objectiveId}
          />
        </TabsContent>
        
        <TabsContent value="history" className="py-4">
          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-medium mb-4">Objective History</h3>
              <div className="text-center py-8 text-muted-foreground">
                No history available.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
