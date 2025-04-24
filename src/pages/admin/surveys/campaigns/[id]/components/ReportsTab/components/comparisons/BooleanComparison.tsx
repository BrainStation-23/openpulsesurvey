
import { useState, useEffect } from "react";
import { GroupedBarChart } from "../../charts/GroupedBarChart";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useDimensionComparison } from "../../hooks/useDimensionComparison";

interface BooleanComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
  campaignId: string;
  instanceId: string;
}

interface GroupedData {
  name: string;
  Yes: number;
  No: number;
  [key: string]: string | number;
}

export function BooleanComparison({
  responses,
  questionName,
  dimension,
  campaignId,
  instanceId
}: BooleanComparisonProps) {
  const { data, isLoading, error } = useDimensionComparison(
    campaignId,
    instanceId,
    questionName,
    dimension,
    false,
    true
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading comparison data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>No comparison data available</AlertTitle>
        <AlertDescription>
          {dimension === 'supervisor' 
            ? 'Supervisors need at least 4 responses to be included in the comparison.'
            : 'No data available for the selected comparison.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Transform the data for the GroupedBarChart
  const chartData: GroupedData[] = data.map(item => ({
    name: item.dimension,
    Yes: item.yes_count,
    No: item.no_count
  }));

  const colors = ["#22c55e", "#ef4444"]; // Green for Yes, Red for No

  return (
    <div className="w-full overflow-x-auto max-w-full">
      <GroupedBarChart 
        data={chartData}
        keys={["Yes", "No"]}
        colors={colors}
        height={320}
      />
    </div>
  );
}
