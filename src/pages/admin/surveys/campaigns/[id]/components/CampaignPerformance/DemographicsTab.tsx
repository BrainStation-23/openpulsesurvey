
import { useCampaignDemographics } from "./hooks/useCampaignDemographics";
import { DemographicPieChart } from "./components/DemographicPieChart";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DemographicsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function DemographicsTab({ campaignId, instances }: DemographicsTabProps) {
  const { demographicData, isLoading } = useCampaignDemographics(campaignId, instances);

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

  if (!hasDepartmentData && !hasLocationData && !hasEmployeeTypeData && !hasEmploymentTypeData) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No demographic data available for this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Chart View</TabsTrigger>
          <TabsTrigger value="tables">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasDepartmentData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicPieChart 
                    data={demographicData.departments} 
                    title="Response Distribution by Department"
                  />
                </CardContent>
              </Card>
            )}

            {hasLocationData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicPieChart 
                    data={demographicData.locations} 
                    title="Response Distribution by Location"
                  />
                </CardContent>
              </Card>
            )}

            {hasEmployeeTypeData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Employee Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicPieChart 
                    data={demographicData.employeeTypes} 
                    title="Response Distribution by Employee Type"
                  />
                </CardContent>
              </Card>
            )}

            {hasEmploymentTypeData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Employment Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DemographicPieChart 
                    data={demographicData.employmentTypes} 
                    title="Response Distribution by Employment Type"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasDepartmentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Department</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.departments.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{item.count}</td>
                          <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {hasLocationData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Location</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.locations.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{item.count}</td>
                          <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {hasEmployeeTypeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Employee Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Employee Type</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.employeeTypes.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{item.count}</td>
                          <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {hasEmploymentTypeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Employment Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Employment Type</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.employmentTypes.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{item.count}</td>
                          <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
