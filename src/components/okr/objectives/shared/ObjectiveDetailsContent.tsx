
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectiveWithRelations, KeyResult } from '@/types/okr';
import { ObjectiveDetailsTab } from '@/components/okr/objectives/ObjectiveDetailsTab';
import { KeyResultsList } from '@/components/okr/key-results/KeyResultsList';

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
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="key-results">Key Results</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
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
          objectiveId={objective.id}
          canEdit={canEditObjective}
          keyResults={keyResults}
        />
      </TabsContent>

      <TabsContent value="comments" className="space-y-6">
        <div className="text-lg font-medium mb-4">Comments</div>
        <p className="text-muted-foreground">Comments section would be implemented here.</p>
      </TabsContent>
    </Tabs>
  );
};
