import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapChart } from "../../charts/HeatMapChart";
import { NpsChart } from "../../charts/NpsChart";
import type { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { supabase } from "@/integrations/supabase/client";

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  isNps: boolean;
  layout?: 'grid' | 'vertical';
}

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

interface NpsData {
  dimension: string;
  ratings: { rating: number; count: number; }[];
}

export function NpsComparison({
  responses,
  questionName,
  dimension,
  isNps,
  layout = 'vertical'
}: NpsComparisonProps) {
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

  const processResponses = async () => {
    if (dimension === 'supervisor') {
      try {
        const { data, error } = await supabase.rpc('get_supervisor_satisfaction', {
          p_campaign_id: responses[0]?.respondent?.campaign_id,
          p_instance_id: responses[0]?.submitted_at ? responses[0].submitted_at : null,
          p_question_name: questionName
        });

        if (error) {
          console.error('Error fetching supervisor satisfaction:', error);
          return [];
        }

        return data.map((row: any) => ({
          dimension: row.dimension,
          total: row.total,
          detractors: row.unsatisfied,
          passives: row.neutral,
          promoters: row.satisfied
        }));
      } catch (error) {
        console.error('Error in supervisor satisfaction RPC:', error);
        return [];
      }
    }

    if (isNps) {
      const dimensionData = new Map<string, number[]>();

      responses.forEach((response) => {
        const questionData = response.answers[questionName];
        if (!questionData || typeof questionData.answer !== "number") return;

        const answer = questionData.answer;
        let dimensionValue = "Unknown";

        switch (dimension) {
          case "sbu":
            dimensionValue = response.respondent.sbu?.name || "Unknown";
            break;
          case "gender":
            dimensionValue = response.respondent.gender || "Unknown";
            break;
          case "location":
            dimensionValue = response.respondent.location?.name || "Unknown";
            break;
          case "employment_type":
            dimensionValue = response.respondent.employment_type?.name || "Unknown";
            break;
          case "level":
            dimensionValue = response.respondent.level?.name || "Unknown";
            break;
          case "employee_type":
            dimensionValue = response.respondent.employee_type?.name || "Unknown";
            break;
          case "employee_role":
            dimensionValue = response.respondent.employee_role?.name || "Unknown";
            break;
        }

        if (!dimensionData.has(dimensionValue)) {
          dimensionData.set(dimensionValue, new Array(11).fill(0));
        }

        const ratings = dimensionData.get(dimensionValue)!;
        if (answer >= 0 && answer <= 10) {
          ratings[answer]++;
        }
      });

      return Array.from(dimensionData.entries()).map(([dimension, ratings]) => ({
        dimension,
        ratings: ratings.map((count, rating) => ({ rating, count }))
      })) as NpsData[];
    }

    const dimensionData = new Map<string, HeatMapData>();

    responses.forEach((response) => {
      const questionData = response.answers[questionName];
      if (!questionData || typeof questionData.answer !== "number") return;

      const answer = questionData.answer;
      let dimensionValue = "Unknown";

      switch (dimension) {
        case "sbu":
          dimensionValue = response.respondent.sbu?.name || "Unknown";
          break;
        case "gender":
          dimensionValue = response.respondent.gender || "Unknown";
          break;
        case "location":
          dimensionValue = response.respondent.location?.name || "Unknown";
          break;
        case "employment_type":
          dimensionValue = response.respondent.employment_type?.name || "Unknown";
          break;
        case "level":
          dimensionValue = response.respondent.level?.name || "Unknown";
          break;
        case "employee_type":
          dimensionValue = response.respondent.employee_type?.name || "Unknown";
          break;
        case "employee_role":
          dimensionValue = response.respondent.employee_role?.name || "Unknown";
          break;
      }

      if (!dimensionData.has(dimensionValue)) {
        dimensionData.set(dimensionValue, {
          dimension: dimensionValue,
          unsatisfied: 0,
          neutral: 0,
          satisfied: 0,
          total: 0
        });
      }

      const group = dimensionData.get(dimensionValue)!;
      group.total += 1;

      if (answer <= 3) {
        group.unsatisfied += 1;
      } else if (answer === 4) {
        group.neutral += 1;
      } else {
        group.satisfied += 1;
      }
    });

    return Array.from(dimensionData.values());
  };

  const data = processResponses();
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isNps) {
    return (
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
        {(data as NpsData[]).map((groupData) => (
          <Card key={groupData.dimension}>
            <CardHeader>
              <CardTitle className="text-lg">{groupData.dimension}</CardTitle>
            </CardHeader>
            <CardContent>
              <NpsChart data={groupData.ratings} />
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
        <HeatMapChart data={data as HeatMapData[]} />
      </CardContent>
    </Card>
  );
}
