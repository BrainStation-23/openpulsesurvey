
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Response, FilterOptions } from "./types";
import { ResponsesList } from "./ResponsesList";
import { ResponsesFilters } from "./ResponsesFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportResponses } from "./utils/export";

interface ResponsesTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponsesTab({ campaignId, instanceId }: ResponsesTabProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  const { data: responses, isLoading } = useQuery({
    queryKey: ["responses", campaignId, instanceId, filters],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          submitted_at,
          response_data,
          campaign_instance_id,
          assignment:survey_assignments!inner(
            id,
            campaign_id,
            campaign:survey_campaigns(
              id,
              name,
              anonymous
            )
          ),
          user:profiles!inner(
            id,
            first_name,
            last_name,
            email,
            user_sbus(
              is_primary,
              sbu:sbus(
                id,
                name
              )
            ),
            user_supervisors!user_supervisors_user_id_fkey(
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey(
                id,
                first_name,
                last_name,
                email
              )
            )
          )`
        )
        .eq('assignment.campaign_id', campaignId)
        .order('created_at', { ascending: filters.sortDirection === "asc" });

      if (instanceId) {
        query.eq('campaign_instance_id', instanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Response[];
    },
  });

  const handleExport = () => {
    if (responses) {
      exportResponses(responses);
    }
  };

  // Group responses by period number
  const groupedResponses = responses?.reduce((acc: Record<number, Response[]>, response) => {
    const periodNumber = response.campaign_instance_id ? 1 : 0;
    acc[periodNumber] = [...(acc[periodNumber] || []), response];
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse bg-muted rounded" />
        <div className="h-32 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ResponsesFilters filters={filters} onFiltersChange={setFilters} />
        <Button variant="outline" onClick={handleExport} disabled={!responses?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <ResponsesList groupedResponses={groupedResponses} />
    </div>
  );
}
