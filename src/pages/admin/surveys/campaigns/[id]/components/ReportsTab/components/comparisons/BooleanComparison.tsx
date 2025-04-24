
import { useState, useEffect } from "react";
import { GroupedBarChart } from "../../charts/GroupedBarChart";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Updated interface with non-nullable campaignId and instanceId
interface BooleanComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
  campaignId: string;  // Changed from nullable to required
  instanceId: string;  // Changed from nullable to required
}

// Update the interface to include an index signature to match the GroupedBarChart requirements
interface GroupedData {
  name: string;
  Yes: number;
  No: number;
  [key: string]: string | number; // Add this index signature
}

export function BooleanComparison({
  responses,
  questionName,
  dimension,
  campaignId,
  instanceId
}: BooleanComparisonProps) {
  const [data, setData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupervisorData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }
      
      const { data: supervisorData, error: rpcError } = await supabase.rpc(
        'get_supervisor_bool',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName
        }
      );
      
      if (rpcError) throw rpcError;
      
      // Transform data for GroupedBarChart
      return supervisorData.map((item: any) => ({
        name: item.dimension || "Unknown Supervisor",
        Yes: item.yes_count,
        No: item.no_count
      }));
    } catch (err) {
      console.error("Error fetching supervisor data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch supervisor data'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const processResponses = () => {
    const dimensionData = new Map<string, { yes: number; no: number }>();

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
      if (typeof answer !== "boolean") return;

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
        dimensionData.set(dimensionValue, { yes: 0, no: 0 });
      }

      const counts = dimensionData.get(dimensionValue)!;
      if (answer) {
        counts.yes++;
      } else {
        counts.no++;
      }
    });

    return Array.from(dimensionData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dimension, counts]) => ({
        name: dimension,
        Yes: counts.yes,
        No: counts.no
      }));
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

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const colors = ["#22c55e", "#ef4444"]; // Green for Yes, Red for No

  return (
    <div className="w-full overflow-x-auto max-w-full">
      <GroupedBarChart 
        data={data}
        keys={["Yes", "No"]}
        colors={colors}
        height={320}
      />
    </div>
  );
}
