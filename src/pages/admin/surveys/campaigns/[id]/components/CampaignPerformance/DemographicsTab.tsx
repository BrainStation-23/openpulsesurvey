
import { useCampaignDemographics } from "./hooks/useCampaignDemographics";
import { DemographicPieChart } from "./components/DemographicPieChart";
import { DemographicBarChart } from "./components/DemographicBarChart";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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

  const ChartComponent = chartType === "pie" ? DemographicPieChart : DemographicBarChart;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Demographic Analysis</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Chart Type:</span>
          <Select
            value={chartType}
            onValueChange={(value) => setChartType(value as "pie" | "bar")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartComponent 
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
                  <ChartComponent 
                    data={demographicData.locations} 
                    title="Response Distribution by Location"
                  />
                </CardContent>
              </Card>
            )}

            {hasGenderData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartComponent 
                    data={demographicData.genders} 
                    title="Response Distribution by Gender"
                  />
                </CardContent>
              </Card>
            )}

            {hasLevelData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartComponent 
                    data={demographicData.levels} 
                    title="Response Distribution by Level"
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
                  <ChartComponent 
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
                  <ChartComponent 
                    data={demographicData.employmentTypes} 
                    title="Response Distribution by Employment Type"
                  />
                </CardContent>
              </Card>
            )}

            {hasAgeGroupData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartComponent 
                    data={demographicData.ageGroups} 
                    title="Response Distribution by Age Group"
                    nameKey="ageGroup"
                  />
                </CardContent>
              </Card>
            )}

            {hasTenureData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tenure Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartComponent 
                    data={demographicData.tenureGroups} 
                    title="Response Distribution by Tenure"
                    nameKey="tenureGroup"
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

            {hasGenderData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Gender</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.genders.map((item, index) => (
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

            {hasLevelData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Level</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.levels.map((item, index) => (
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

            {hasAgeGroupData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Age Group</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.ageGroups.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.ageGroup}</td>
                          <td className="text-right py-2">{item.count}</td>
                          <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {hasTenureData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tenure Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Tenure</th>
                        <th className="text-right py-2">Count</th>
                        <th className="text-right py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demographicData.tenureGroups.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.tenureGroup}</td>
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
