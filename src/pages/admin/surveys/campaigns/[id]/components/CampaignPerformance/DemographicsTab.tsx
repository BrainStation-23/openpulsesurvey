
import { useState } from "react";
import { useCampaignDemographics } from "./hooks/useCampaignDemographics";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTypeSelector } from "./components/demographics/ChartTypeSelector";
import { DemographicCard } from "./components/demographics/DemographicCard";
import { DemographicTable } from "./components/demographics/DemographicTable";

interface DemographicsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function DemographicsTab({ campaignId, instances }: DemographicsTabProps) {
  const { demographicData, isLoading } = useCampaignDemographics(campaignId, instances);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!demographicData) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No demographic data available for this campaign</p>
      </div>
    );
  }

  const hasDepartmentData = demographicData.departments?.length > 0;
  const hasLocationData = demographicData.locations?.length > 0;
  const hasEmployeeTypeData = demographicData.employeeTypes?.length > 0;
  const hasEmploymentTypeData = demographicData.employmentTypes?.length > 0;
  const hasGenderData = demographicData.genders?.length > 0;
  const hasLevelData = demographicData.levels?.length > 0;
  const hasAgeGroupData = demographicData.ageGroups?.length > 0;
  const hasTenureData = demographicData.tenureGroups?.length > 0;

  const hasAnyData = hasDepartmentData || hasLocationData || hasEmployeeTypeData || 
                     hasEmploymentTypeData || hasGenderData || hasLevelData || 
                     hasAgeGroupData || hasTenureData;

  if (!hasAnyData) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No demographic data available for this campaign</p>
      </div>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasDepartmentData && (
              <DemographicCard 
                title="Department Distribution"
                data={demographicData.departments}
                chartType={chartType}
              />
            )}

            {hasLocationData && (
              <DemographicCard 
                title="Location Distribution"
                data={demographicData.locations}
                chartType={chartType}
              />
            )}

            {hasGenderData && (
              <DemographicCard 
                title="Gender Distribution"
                data={demographicData.genders}
                chartType={chartType}
              />
            )}

            {hasLevelData && (
              <DemographicCard 
                title="Level Distribution"
                data={demographicData.levels}
                chartType={chartType}
              />
            )}

            {hasEmployeeTypeData && (
              <DemographicCard 
                title="Employee Type Distribution"
                data={demographicData.employeeTypes}
                chartType={chartType}
              />
            )}

            {hasEmploymentTypeData && (
              <DemographicCard 
                title="Employment Type Distribution"
                data={demographicData.employmentTypes}
                chartType={chartType}
              />
            )}

            {hasAgeGroupData && (
              <DemographicCard 
                title="Age Group Distribution"
                data={demographicData.ageGroups}
                chartType={chartType}
                nameKey="ageGroup"
              />
            )}

            {hasTenureData && (
              <DemographicCard 
                title="Tenure Distribution"
                data={demographicData.tenureGroups}
                chartType={chartType}
                nameKey="tenureGroup"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasDepartmentData && (
              <DemographicTable 
                title="Department"
                data={demographicData.departments}
              />
            )}

            {hasLocationData && (
              <DemographicTable 
                title="Location"
                data={demographicData.locations}
              />
            )}

            {hasGenderData && (
              <DemographicTable 
                title="Gender"
                data={demographicData.genders}
              />
            )}

            {hasLevelData && (
              <DemographicTable 
                title="Level"
                data={demographicData.levels}
              />
            )}

            {hasEmployeeTypeData && (
              <DemographicTable 
                title="Employee Type"
                data={demographicData.employeeTypes}
              />
            )}

            {hasEmploymentTypeData && (
              <DemographicTable 
                title="Employment Type"
                data={demographicData.employmentTypes}
              />
            )}

            {hasAgeGroupData && (
              <DemographicTable 
                title="Age Group"
                data={demographicData.ageGroups}
                nameKey="ageGroup"
              />
            )}

            {hasTenureData && (
              <DemographicTable 
                title="Tenure"
                data={demographicData.tenureGroups}
                nameKey="tenureGroup"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="cross-tab">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cross-Tabulation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Cross-tabulation analysis is coming soon. This feature will allow you to compare response patterns across different demographic groups.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
