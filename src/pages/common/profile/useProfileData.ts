
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/pages/admin/users/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useProfileData() {
  const { user: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userData, error: userError } = useQuery({
    queryKey: ["userProfile", currentUser?.id],
    queryFn: async () => {
      console.log("Starting userProfile query for userId:", currentUser?.id);
      
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching user data from API...");
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          profile_image_url,
          level_id,
          levels (
            id,
            name,
            status
          ),
          user_sbus (
            id,
            user_id,
            sbu_id,
            is_primary,
            sbu:sbus (
              id,
              name
            )
          ),
          org_id,
          gender,
          date_of_birth,
          designation,
          location_id,
          locations (
            id,
            name
          ),
          employment_type_id,
          employment_types (
            id,
            name
          ),
          employee_role_id,
          employee_roles (
            id,
            name
          ),
          employee_type_id,
          employee_types (
            id,
            name
          ),
          status
        `)
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error("Profile not found");
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (roleError) throw roleError;

      const processedData = {
        ...profileData,
        level: profileData.levels?.name || null,
        employment_type: profileData.employment_types?.name || null,
        employee_role: profileData.employee_roles?.name || null,
        employee_type: profileData.employee_types?.name || null,
        location: profileData.locations?.name || null,
        user_roles: roleData
      } as User;

      console.log("Processed user data:", processedData);
      return processedData;
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (userData) {
      setProfileUser(userData);
      setIsLoading(false);
    }
  }, [userData]);

  return {
    profileUser,
    isLoading: isLoading || isAuthLoading,
    userError,
    currentUser
  };
}
