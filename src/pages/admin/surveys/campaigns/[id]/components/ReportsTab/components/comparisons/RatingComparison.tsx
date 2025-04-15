
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapChart } from "../../charts/HeatMapChart";
import { RatingScaleChart, NpsScaleChart } from "../../charts/RatingScaleChart";
import type { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRatingProcessing } from "../../hooks/useRatingProcessing";
import { isNpsQuestion } from "../../../PresentationView/types/questionTypes";

interface RatingComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  question: any;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
  campaignId?: string;
  instanceId?: string;
}

export function RatingComparison({
  responses,
  questionName,
  question,
  dimension,
  layout = 'vertical',
  campaignId,
  instanceId
}: RatingComparisonProps) {
  const { data, isLoading, error, isNps } = useRatingProcessing(
    responses, 
    questionName, 
    question, 
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
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isNps && dimension !== "supervisor") {
    return (
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
        {data.map((groupData) => (
          <Card key={groupData.dimension}>
            <CardHeader>
              <CardTitle className="text-lg">{groupData.dimension}</CardTitle>
            </CardHeader>
            <CardContent>
              <NpsScaleChart data={groupData} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getDimensionTitle(dimension)}</CardTitle>
      </CardHeader>
      <CardContent>
        <HeatMapChart data={data} />
      </CardContent>
    </Card>
  );
}
