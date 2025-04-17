
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDualInstanceSelector } from "./components/EnhancedDualInstanceSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SBUPerformanceTab } from "./components/SBUPerformanceTab";
import { SupervisorPerformanceTab } from "./components/SupervisorPerformanceTab";
import { QuestionResponsesTab } from "./components/QuestionResponsesTab";

export function InstanceCompareTab() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();
  const [activeTab, setActiveTab] = useState("sbu");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDualInstanceSelector
            campaignId={campaignId || ''}
            baseInstanceId={baseInstanceId}
            comparisonInstanceId={comparisonInstanceId}
            onBaseInstanceSelect={setBaseInstanceId}
            onComparisonInstanceSelect={setComparisonInstanceId}
          />
        </CardContent>
      </Card>

      {baseInstanceId && comparisonInstanceId && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="sbu">SBU Performance</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisor Performance</TabsTrigger>
            <TabsTrigger value="questions">Question Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sbu">
            <SBUPerformanceTab 
              campaignId={campaignId}
              baseInstanceId={baseInstanceId}
              comparisonInstanceId={comparisonInstanceId}
            />
          </TabsContent>
          
          <TabsContent value="supervisors">
            <SupervisorPerformanceTab 
              baseInstanceId={baseInstanceId}
              comparisonInstanceId={comparisonInstanceId}
            />
          </TabsContent>
          
          <TabsContent value="questions">
            <QuestionResponsesTab 
              baseInstanceId={baseInstanceId}
              comparisonInstanceId={comparisonInstanceId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
