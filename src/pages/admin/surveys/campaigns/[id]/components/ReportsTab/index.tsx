
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonSelector } from "../ComparisonSelector";
import { ComparisonDimension } from "./types/comparison";
import { InstanceComparison } from "./components/InstanceComparison";
import { OverviewTab } from "./components/OverviewTab";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const [comparisonDimension, setComparisonDimension] = useState<ComparisonDimension>("none");

  return (
    <Tabs defaultValue="insights" className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="comparison">Instance Comparison</TabsTrigger>
        </TabsList>
        <ComparisonSelector value={comparisonDimension} onChange={setComparisonDimension} />
      </div>

      <TabsContent value="insights" className="space-y-6">
        <OverviewTab campaignId={campaignId} instanceId={instanceId} comparisonDimension={comparisonDimension} />
      </TabsContent>

      <TabsContent value="comparison" className="space-y-6">
        <InstanceComparison campaignId={campaignId} />
      </TabsContent>
    </Tabs>
  );
}
