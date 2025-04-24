
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapChart } from "../../charts/HeatMapChart";
import type { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { NpsComparisonTable } from "./NpsComparisonTable";
import { NpsComparisonData } from "../../types/nps";

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
  responses,
  questionName,
  dimension,
  isNps,
  layout = 'vertical',
  campaignId,
  instanceId
}: NpsComparisonProps) {
  const [data, setData] = useState<HeatMapData[] | NpsComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const fetchSupervisorData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }
      
      const rpcName = isNps ? 'get_supervisor_enps' : 'get_supervisor_satisfaction';
      const { data: supervisorData, error: rpcError } = await supabase.rpc(
        rpcName,
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName
        }
      );
      
      if (rpcError) throw rpcError;

      if (isNps) {
        // The RPC returns data in the exact format we need
        return supervisorData as NpsComparisonData[];
      } else {
        // Need to explicitly type this to help TypeScript
        return (supervisorData as Array<{
          dimension: string;
          unsatisfied: number;
          neutral: number;
          satisfied: number;
          total: number;
          avg_score: number;
        }>).map((item) => ({
          dimension: item.dimension || "Unknown Supervisor",
          unsatisfied: item.unsatisfied,
          neutral: item.neutral,
          satisfied: item.satisfied,
          total: item.total,
          avg_score: item.avg_score
        }));
      }
    } catch (err) {
      console.error("Error fetching supervisor data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch supervisor data'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const processResponses = () => {
    if (isNps) {
      const dimensionData = new Map<string, NpsComparisonData>();

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
            detractors: 0,
            passives: 0,
            promoters: 0,
            total: 0,
            nps_score: 0
          });
        }

        const group = dimensionData.get(dimensionValue)!;
        group.total += 1;

        if (answer <= 6) {
          group.detractors += 1;
        } else if (answer <= 8) {
          group.passives += 1;
        } else {
          group.promoters += 1;
        }

        // Calculate NPS score
        group.nps_score = ((group.promoters - group.detractors) / group.total) * 100;
      });

      return Array.from(dimensionData.values());
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

    return Array.from(dimensionData.values()).sort((a, b) => a.dimension.localeCompare(b.dimension));
  };

  useEffect(() => {
    const loadData = async () => {
      if (dimension === "supervisor") {
        const supervisorData = await fetchSupervisorData();
        setData(supervisorData);
      } else {
        setData(processResponses());
      }
    };

    loadData();
  }, [dimension, questionName, responses]);
  
  if (loading) {
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

  if (isNps) {
    return (
      <div className="w-full">
        <NpsComparisonTable data={data as NpsComparisonData[]} />
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
