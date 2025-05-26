
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupervisorList } from "./components/SupervisorList";
import { AnalysisDisplay } from "./components/AnalysisDisplay";
import { useSupervisorAnalysis } from "./hooks/useSupervisorAnalysis";
import { CheckCircle, Clock, Users } from "lucide-react";

interface SupervisorAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function SupervisorAnalyzeTab({ campaignId, instanceId }: SupervisorAnalyzeTabProps) {
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>();
  
  const { data, isLoading } = useSupervisorAnalysis(campaignId, instanceId);
  const supervisors = data?.supervisors || [];
  const stats = data?.stats || { total_eligible: 0, with_analysis: 0, pending_analysis: 0 };

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
    <div className="space-y-6">
      {/* Statistics Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervisor Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_eligible}</div>
                <div className="text-sm text-muted-foreground">Eligible Supervisors</div>
                <div className="text-xs text-muted-foreground">(4+ team members)</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.with_analysis}</div>
                <div className="text-sm text-muted-foreground">Analysis Generated</div>
                <Badge variant="success" className="text-xs">
                  {stats.total_eligible > 0 ? Math.round((stats.with_analysis / stats.total_eligible) * 100) : 0}% Complete
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.pending_analysis}</div>
                <div className="text-sm text-muted-foreground">Pending Analysis</div>
                {stats.pending_analysis > 0 && (
                  <div className="text-xs text-muted-foreground">Generate feedback to create</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
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
    </div>
  );
}
