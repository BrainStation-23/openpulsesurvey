
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptSelector } from "./components/PromptSelector";
import { AnalysisViewer } from "./components/AnalysisViewer";
import { useAnalysisData } from "./hooks/useAnalysisData";
import { AIQueueMonitor } from "../AIQueueMonitor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalyzeTabProps {
  campaignId: string;
  instanceId?: string;
}

export function AIAnalyzeTab({ campaignId, instanceId }: AIAnalyzeTabProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>();

  // Get instance status for the AI Queue Monitor
  const { data: instance } = useQuery({
    queryKey: ["campaign-instance", instanceId],
    queryFn: async () => {
      if (!instanceId) return null;
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("status")
        .eq("id", instanceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!instanceId,
  });

  const { data: analysis, isLoading, error } = useAnalysisData(
    campaignId, 
    instanceId, 
    selectedPromptId
  );

  if (!instanceId) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIQueueMonitor />
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please select a campaign instance to view AI analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIQueueMonitor 
          instanceStatus={instance?.status}
          selectedInstanceId={instanceId}
        />
        <PromptSelector
          selectedPromptId={selectedPromptId}
          onPromptChange={setSelectedPromptId}
        />
      </div>

      {selectedPromptId && (
        <AnalysisViewer
          analysis={analysis}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
