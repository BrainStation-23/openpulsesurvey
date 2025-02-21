
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

      let query = supabase
        .from("survey_assignments")
        .select(`
          id,
          survey:surveys (
            id,
            name,
            description
          ),
          campaign:survey_campaigns (
            id,
            name,
            starts_at,
            ends_at
          )
        `)
        .eq("user_id", user.user.id);

      if (searchQuery) {
        query = query.or(
          `survey.name.ilike.%${searchQuery}%,survey.description.ilike.%${searchQuery}%,campaign.name.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Survey[];
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
