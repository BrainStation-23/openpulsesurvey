
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupervisorList } from "./components/SupervisorList";
import { AnalysisDisplay } from "./components/AnalysisDisplay";
import { useSupervisorAnalysis } from "./hooks/useSupervisorAnalysis";

interface SupervisorAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function SupervisorAnalyzeTab({ campaignId, instanceId }: SupervisorAnalyzeTabProps) {
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>();
  
  const { data: supervisors, isLoading } = useSupervisorAnalysis(campaignId, instanceId);

  if (!instanceId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please select a campaign instance to view supervisor analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedSupervisor = supervisors?.find(s => s.supervisor_id === selectedSupervisorId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      <div className="space-y-4">
        <SupervisorList
          supervisors={supervisors || []}
          selectedSupervisorId={selectedSupervisorId}
          onSelectSupervisor={setSelectedSupervisorId}
          isLoading={isLoading}
        />
      </div>
      
      <div className="space-y-4">
        <AnalysisDisplay
          supervisor={selectedSupervisor}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
