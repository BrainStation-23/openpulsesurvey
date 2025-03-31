
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectiveWithRelations, KeyResult } from '@/types/okr';
import { ObjectiveDetailsTab } from '@/components/okr/objectives/ObjectiveDetailsTab';
import { ObjectiveComments } from '@/components/okr/comments/ObjectiveComments';
import { KeyResultsList } from '@/components/okr/key-results/KeyResultsList';
import { ObjectiveAlignments } from '@/components/okr/alignments/ObjectiveAlignments';
import { ObjectivePermissionsTab } from '@/components/okr/objectives/ObjectivePermissionsTab';

interface ObjectiveDetailsContentProps {
  objective: ObjectiveWithRelations;
  keyResults: KeyResult[];
  isAdmin?: boolean;
  canEditObjective?: boolean;
  defaultTab?: string;
}

export const ObjectiveDetailsContent: React.FC<ObjectiveDetailsContentProps> = ({
  objective,
  keyResults,
  isAdmin = false,
  canEditObjective = false,
  defaultTab = "details"
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const routePrefix = isAdmin ? '/admin' : '/user';
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="key-results">Key Results</TabsTrigger>
        <TabsTrigger value="alignments">Alignments</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <ObjectiveDetailsTab 
          objective={objective} 
          keyResults={keyResults} 
          isAdmin={isAdmin}
        />
      </TabsContent>

      <TabsContent value="key-results" className="space-y-6">
        <KeyResultsList
          objective={objective}
          keyResults={keyResults}
          isAdmin={isAdmin}
          canEdit={canEditObjective}
        />
      </TabsContent>

      <TabsContent value="alignments" className="space-y-6">
        <ObjectiveAlignments 
          objective={objective} 
          isAdmin={isAdmin}
        />
      </TabsContent>

      <TabsContent value="comments" className="space-y-6">
        <ObjectiveComments 
          objectiveId={objective.id} 
          objectiveTitle={objective.title}
        />
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        <ObjectivePermissionsTab
          objective={objective}
          isAdmin={isAdmin}
        />
      </TabsContent>
    </Tabs>
  );
};
