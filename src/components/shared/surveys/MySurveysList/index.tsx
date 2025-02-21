
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SurveyFilters from "./components/SurveyFilters";
import SurveyCard from "./components/SurveyCard";

interface Survey {
  id: string;
  survey: {
    id: string;
    name: string;
    description: string | null;
  };
  campaign: {
    id: string;
    name: string;
    starts_at: string;
    ends_at: string | null;
  };
}

export default function MySurveysList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(["assigned", "in_progress"]);

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["my-surveys", searchQuery, statusFilter],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // First get the campaign instances
      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          survey:surveys(
            id,
            name,
            description
          ),
          campaign:survey_campaigns!campaign_id(
            id,
            name,
            starts_at,
            ends_at
          ),
          responses:survey_responses(
            status
          )
        `)
        .eq("user_id", user.user.id);

      if (assignmentsError) throw assignmentsError;

      // Filter based on status
      const filteredAssignments = assignments?.filter(assignment => {
        const status = assignment.responses?.[0]?.status || 'assigned';
        return statusFilter.includes(status);
      });

      // If there's a search query, filter further
      if (searchQuery && filteredAssignments) {
        return filteredAssignments.filter(assignment => 
          assignment.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.survey.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filteredAssignments || [];
    },
  });

  return (
    <div className="space-y-6">
      <SurveyFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        isLoading={isLoading}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys?.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
        {!isLoading && (!surveys || surveys.length === 0) && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No surveys found</p>
          </div>
        )}
      </div>
    </div>
  );
}
