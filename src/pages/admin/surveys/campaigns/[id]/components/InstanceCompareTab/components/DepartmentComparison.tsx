
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart } from "../../ReportsTab/charts/GroupedBarChart";
import type { InstanceMetrics } from "../types/instance-comparison";

interface DepartmentComparisonProps {
  baseInstance: InstanceMetrics;
  comparisonInstance: InstanceMetrics;
}

export function DepartmentComparison({ baseInstance, comparisonInstance }: DepartmentComparisonProps) {
  // For this example, we'll use dummy data since the actual SBU data structure isn't provided
  // In a real implementation, you would use the actual SBU data from the instances
  const departmentData = [
    {
      name: "Department A",
      "Base Instance": 75,
      "Comparison Instance": 82,
    },
    {
      name: "Department B",
      "Base Instance": 65,
      "Comparison Instance": 70,
    },
    // Add more departments as needed
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Response Rate Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <GroupedBarChart
          data={departmentData}
          keys={["Base Instance", "Comparison Instance"]}
          height={300}
        />
      </CardContent>
    </Card>
  );
}
