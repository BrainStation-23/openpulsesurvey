
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { toast } from "sonner";

export function useSupervisorManagement(user: User | null) {
  console.log('useSupervisorManagement hook called with user:', user?.id);
  const startTime = performance.now();
  
  const queryClient = useQueryClient();
  const [primarySupervisor, setPrimarySupervisor] = useState<string | null>(null);

  const { data: supervisors = [], isLoading: supervisorsLoading } = useQuery({
    queryKey: ["supervisors", user?.id],
    queryFn: async () => {
      console.log('Starting supervisors fetch for user:', user?.id);
      const fetchStartTime = performance.now();
      
      if (!user) {
        console.log('No user provided, returning empty array');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from("user_supervisors")
          .select(`
            supervisor_id,
            is_primary,
            supervisor:profiles!user_supervisors_supervisor_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            )
          `)
          .eq("user_id", user.id);

        const fetchDuration = performance.now() - fetchStartTime;
        console.log(`Supervisors fetch completed in ${fetchDuration.toFixed(2)}ms`);
        
        if (error) {
          console.error('Error fetching supervisors:', error);
          throw error;
        }

        console.log('Supervisors data received:', data);
        return data.map(({ supervisor, is_primary }) => ({
          ...supervisor,
          is_primary,
        }));
      } catch (error) {
        console.error('Error in supervisors query:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const hookDuration = performance.now() - startTime;
    console.log(`useSupervisorManagement initialization took ${hookDuration.toFixed(2)}ms`);
  }, [startTime]);

  const updateSupervisorMutation = useMutation({
    mutationFn: async ({
      supervisorId,
      action,
    }: {
      supervisorId: string;
      action: "add" | "remove";
    }) => {
      if (!user) throw new Error("No user selected");

      if (action === "add") {
        const { error } = await supabase
          .from("user_supervisors")
          .insert({
            user_id: user.id,
            supervisor_id: supervisorId,
            is_primary: supervisors.length === 0, // Make primary if first supervisor
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_supervisors")
          .delete()
          .eq("user_id", user.id)
          .eq("supervisor_id", supervisorId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", user?.id] });
      toast.success(
        "Supervisor list updated successfully"
      );
    },
    onError: (error) => {
      console.error("Supervisor update error:", error);
      toast.error("Failed to update supervisor list");
    },
  });

  const updatePrimarySupervisorMutation = useMutation({
    mutationFn: async (supervisorId: string) => {
      if (!user) throw new Error("No user selected");

      // Begin transaction
      const { error: updateError } = await supabase
        .from("user_supervisors")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      const { error: setPrimaryError } = await supabase
        .from("user_supervisors")
        .update({ is_primary: true })
        .eq("user_id", user.id)
        .eq("supervisor_id", supervisorId);

      if (setPrimaryError) throw setPrimaryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", user?.id] });
      toast.success("Primary supervisor updated successfully");
    },
    onError: (error) => {
      console.error("Primary supervisor update error:", error);
      toast.error("Failed to update primary supervisor");
    },
  });

  const handleSupervisorChange = useCallback(
    (supervisorId: string, action: "add" | "remove") => {
      updateSupervisorMutation.mutate({ supervisorId, action });
    },
    [updateSupervisorMutation]
  );

  const handlePrimarySupervisorChange = useCallback(
    (supervisorId: string) => {
      updatePrimarySupervisorMutation.mutate(supervisorId);
    },
    [updatePrimarySupervisorMutation]
  );

  return {
    supervisors,
    supervisorsLoading,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  };
}
