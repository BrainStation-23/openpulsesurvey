
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart } from "../../ReportsTab/charts/GroupedBarChart";
import type { InstanceMetrics } from "../types/instance-comparison";

interface DemographicComparisonProps {
  baseInstance: InstanceMetrics;
  comparisonInstance: InstanceMetrics;
}

export function DemographicComparison({ baseInstance, comparisonInstance }: DemographicComparisonProps) {
  const locationData = Object.entries(baseInstance.location_breakdown || {}).map(([location, count]) => ({
    name: location,
    "Base Instance": count as number,
    "Comparison Instance": comparisonInstance.location_breakdown?.[location] || 0,
  }));

  const genderData = Object.entries(baseInstance.gender_breakdown || {}).map(([gender, count]) => ({
    name: gender,
    "Base Instance": count as number,
    "Comparison Instance": comparisonInstance.gender_breakdown?.[gender] || 0,
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupedBarChart
            data={locationData}
            keys={["Base Instance", "Comparison Instance"]}
            height={300}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupedBarChart
            data={genderData}
            keys={["Base Instance", "Comparison Instance"]}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}
