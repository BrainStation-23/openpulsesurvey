
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface SearchUsersResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  designation: string;
  status: string;
  location_name: string;
  sbu_name: string;
  level_name: string;
}

export function useSearchProfiles(searchTerm: string) {
  return useQuery({
    queryKey: ["profiles", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return { data: [], count: 0 };
      }
      
      const { data, error } = await supabase.rpc("search_users", {
        p_search_term: searchTerm,
        p_limit: 5,
        p_offset: 0,
      });
      
      if (error) throw error;
      
      // Transform the data to match the Profile interface
      const profiles = (data as SearchUsersResponse[]).map(item => ({
        id: item.id,
        email: item.email,
        first_name: item.first_name,
        last_name: item.last_name
      } as Profile));
      
      return {
        data: profiles,
        count: data?.length || 0,
      };
    },
    enabled: searchTerm.trim().length > 0,
  });
}
