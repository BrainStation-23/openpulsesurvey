
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, UserSBU } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU: string;
  selectedLevel: string;
  selectedLocation: string;
  selectedEmploymentType: string;
  selectedEmployeeRole: string;
  selectedEmployeeType: string;
}

interface SearchUsersRPCResponse {
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

export function useUsers({ 
  currentPage, 
  pageSize, 
  searchTerm, 
  selectedSBU,
  selectedLevel,
  selectedLocation,
  selectedEmploymentType,
  selectedEmployeeRole,
  selectedEmployeeType 
}: UseUsersProps) {
  return useQuery({
    queryKey: [
      "users", 
      currentPage, 
      pageSize, 
      searchTerm, 
      selectedSBU,
      selectedLevel,
      selectedLocation,
      selectedEmploymentType,
      selectedEmployeeRole,
      selectedEmployeeType
    ],
    queryFn: async () => {
      console.log("Fetching users with params:", { 
        currentPage, 
        pageSize, 
        searchTerm, 
        selectedSBU,
        selectedLevel,
        selectedLocation,
        selectedEmploymentType,
        selectedEmployeeRole,
        selectedEmployeeType
      });
      
      const { data, error } = await supabase
        .rpc('search_users', {
          p_search_term: searchTerm,
          p_limit: pageSize,
          p_offset: (currentPage - 1) * pageSize,
        });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // The search_users RPC returns a simplified structure, so we need to get full user data
      const searchResults = data as SearchUsersRPCResponse[];
      const userIds = searchResults.map(item => item.id);
      
      if (userIds.length === 0) {
        return {
          users: [],
          total: 0
        };
      }

      const { data: fullUserData, error: fullUserError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          profile_image_url,
          org_id,
          gender,
          date_of_birth,
          designation,
          status,
          level_id,
          levels (
            name
          ),
          location_id,
          locations (
            name
          ),
          employment_type_id,
          employment_types (
            name
          ),
          employee_role_id,
          employee_roles (
            name
          ),
          employee_type_id,
          employee_types (
            name
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
          )
        `)
        .in('id', userIds);

      if (fullUserError) throw fullUserError;

      // Get user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Get primary supervisors
      const { data: supervisors, error: supervisorsError } = await supabase
        .from('user_supervisors')
        .select(`
          user_id,
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .in('user_id', userIds)
        .eq('is_primary', true);

      if (supervisorsError) throw supervisorsError;

      const transformedUsers = fullUserData?.map(profile => {
        const userRole = userRoles?.find(r => r.user_id === profile.id);
        const supervisor = supervisors?.find(s => s.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          profile_image_url: profile.profile_image_url,
          org_id: profile.org_id,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          designation: profile.designation,
          status: profile.status,
          level: profile.levels?.name || null,
          location: profile.locations?.name || null,
          employment_type: profile.employment_types?.name || null,
          employee_role: profile.employee_roles?.name || null,
          employee_type: profile.employee_types?.name || null,
          user_roles: {
            role: userRole?.role || 'user'
          },
          user_sbus: profile.user_sbus || [],
          primary_supervisor: supervisor?.supervisor || null
        } as User;
      }) || [];

      // Get total count by running search again with count
      const { count } = await supabase
        .rpc('search_users', {
          p_search_term: searchTerm,
          p_limit: 1000000, // Large number to get total count
          p_offset: 0,
        });

      return {
        users: transformedUsers,
        total: searchResults.length // Use the actual returned length for now
      };
    },
  });
}
