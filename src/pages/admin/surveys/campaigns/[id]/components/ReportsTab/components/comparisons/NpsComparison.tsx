
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapChart } from "../../charts/HeatMapChart";
import type { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { NpsComparisonTable } from "./NpsComparisonTable";
import { NpsComparisonData } from "../../types/nps";
import { useDimensionComparison } from "../../hooks/useDimensionComparison";

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  isNps: boolean;
  layout?: 'grid' | 'vertical';
  campaignId?: string;
  instanceId?: string;
}

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score?: number;
}

export function NpsComparison({
  questionName,
  dimension,
  isNps,
  layout = 'vertical',
  campaignId,
  instanceId
}: NpsComparisonProps) {
  const { data, isLoading, error } = useDimensionComparison(
    campaignId,
    instanceId,
    questionName,
    dimension
  );

  const getDimensionTitle = (dim: string) => {
    const titles: Record<string, string> = {
      sbu: "By Department",
      gender: "By Gender",
      location: "By Location",
      employment_type: "By Employment Type",
      level: "By Level",
      employee_type: "By Employee Type",
      employee_role: "By Employee Role",
      supervisor: "By Supervisor"
    };
    return titles[dim] || dim;
  };
  
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
      <Card>
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isNps) {
    // Transform satisfaction data to NPS format
    const npsData: NpsComparisonData[] = data.map(item => ({
      dimension: item.dimension,
      detractors: item.unsatisfied,
      passives: item.neutral,
      promoters: item.satisfied,
      total: item.total,
      nps_score: ((item.satisfied - item.unsatisfied) / item.total) * 100
    }));

    return (
      <div className="w-full">
        <NpsComparisonTable data={npsData} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getDimensionTitle(dimension)}</CardTitle>
      </CardHeader>
      <CardContent>
        <HeatMapChart data={data as HeatMapData[]} />
      </CardContent>
    </Card>
  );
}
