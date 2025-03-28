
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  designation?: string;
  email: string;
  isLoggedInUser: boolean;
};

export type Supervisor = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  designation?: string;
  email: string;
};

export type TeamData = {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
};

export function useTeamData() {
  const { userId } = useCurrentUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["teamData", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Step 1: Fetch the user's primary supervisor
      const { data: supervisorData, error: supervisorError } = await supabase
        .from("user_supervisors")
        .select(`
          supervisor_id,
          is_primary,
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url,
            designation,
            email
          )
        `)
        .eq("user_id", userId)
        .eq("is_primary", true)
        .single();

      if (supervisorError && supervisorError.code !== "PGRST116") {
        throw supervisorError;
      }

      const supervisor = supervisorData?.supervisor 
        ? {
            id: supervisorData.supervisor.id,
            firstName: supervisorData.supervisor.first_name || "",
            lastName: supervisorData.supervisor.last_name || "",
            profileImageUrl: supervisorData.supervisor.profile_image_url,
            designation: supervisorData.supervisor.designation,
            email: supervisorData.supervisor.email
          }
        : null;

      // Step 2: If there's a supervisor, fetch all users who have the same supervisor
      let teamMembers: TeamMember[] = [];
      
      if (supervisor) {
        const { data: teammatesData, error: teammatesError } = await supabase
          .from("user_supervisors")
          .select(`
            user_id,
            is_primary,
            user:profiles!user_supervisors_user_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url,
              designation,
              email
            )
          `)
          .eq("supervisor_id", supervisor.id)
          .eq("is_primary", true);

        if (teammatesError) {
          throw teammatesError;
        }

        teamMembers = (teammatesData || []).map(item => ({
          id: item.user.id,
          firstName: item.user.first_name || "",
          lastName: item.user.last_name || "",
          profileImageUrl: item.user.profile_image_url,
          designation: item.user.designation,
          email: item.user.email,
          isLoggedInUser: item.user.id === userId
        }));
      }

      return {
        supervisor,
        teamMembers
      } as TeamData;
    },
    enabled: !!userId,
  });

  return {
    teamData: data,
    isLoading,
    error
  };
}
