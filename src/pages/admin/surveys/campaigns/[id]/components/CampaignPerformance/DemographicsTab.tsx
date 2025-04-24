
import { useState } from "react";
import { useCampaignDemographics } from "./hooks/useCampaignDemographics";
import { CampaignInstance } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartTypeSelector } from "./components/demographics/ChartTypeSelector";
import { LoadingView } from "./components/demographics/LoadingView";
import { NoDataView } from "./components/demographics/NoDataView";
import { DistributionGridView } from "./components/demographics/DistributionGridView";
import { TableGridView } from "./components/demographics/TableGridView";
import { CrossAnalysisView } from "./components/demographics/CrossAnalysisView";

interface DemographicsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function DemographicsTab({ campaignId, instances }: DemographicsTabProps) {
  const { demographicData, isLoading } = useCampaignDemographics(campaignId, instances);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  if (isLoading) {
    return <LoadingView />;
  }

  if (!demographicData) {
    return <NoDataView />;
  }

  const hasAnyData = Object.values(demographicData).some(data => data?.length > 0);

  if (!hasAnyData) {
    return <NoDataView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Demographic Analysis</h2>
        <ChartTypeSelector value={chartType} onValueChange={setChartType} />
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="tables">Table View</TabsTrigger>
          <TabsTrigger value="cross-tab">Cross Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <DistributionGridView 
            demographicData={demographicData}
            chartType={chartType}
          />
        </TabsContent>

        <TabsContent value="tables">
          <TableGridView demographicData={demographicData} />
        </TabsContent>

        <TabsContent value="cross-tab">
          <CrossAnalysisView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
