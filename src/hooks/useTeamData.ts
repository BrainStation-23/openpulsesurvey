
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export interface Level {
  id: string;
  name: string;
  color_code?: string;
  rank: number;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
  profileImageUrl?: string;
  isLoggedInUser: boolean;
  level?: Level;
}

export interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
  profileImageUrl?: string;
  level?: Level;
}

export interface TeamData {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
}

export const useTeamData = () => {
  const { user } = useCurrentUser();
  
  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team-data', user?.id],
    queryFn: async (): Promise<TeamData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Fetch the user's primary supervisor
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('user_supervisors')
        .select(`
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name,
            email,
            designation,
            profile_image_url,
            level:levels (
              id,
              name,
              color_code,
              rank
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();
      
      if (supervisorError && supervisorError.code !== 'PGRST116') {
        throw supervisorError;
      }
      
      let supervisor: Supervisor | null = null;
      
      if (supervisorData?.supervisor) {
        supervisor = {
          id: supervisorData.supervisor.id,
          firstName: supervisorData.supervisor.first_name,
          lastName: supervisorData.supervisor.last_name,
          email: supervisorData.supervisor.email,
          designation: supervisorData.supervisor.designation,
          profileImageUrl: supervisorData.supervisor.profile_image_url,
          level: supervisorData.supervisor.level ? {
            id: supervisorData.supervisor.level.id,
            name: supervisorData.supervisor.level.name,
            color_code: supervisorData.supervisor.level.color_code,
            rank: supervisorData.supervisor.level.rank || 0
          } : undefined
        };
      }
      
      // If we have a supervisor, fetch all users who also have this supervisor
      let teamMembers: TeamMember[] = [];
      
      if (supervisor) {
        const { data: teammatesData, error: teammatesError } = await supabase
          .from('user_supervisors')
          .select(`
            user:profiles!user_supervisors_user_id_fkey (
              id,
              first_name,
              last_name,
              email,
              designation,
              profile_image_url,
              level:levels (
                id,
                name,
                color_code,
                rank
              )
            )
          `)
          .eq('supervisor_id', supervisor.id)
          .eq('is_primary', true);
        
        if (teammatesError) {
          throw teammatesError;
        }
        
        if (teammatesData) {
          teamMembers = teammatesData
            .filter(item => item.user && item.user.id !== user.id) // Exclude the current user
            .map(item => ({
              id: item.user.id,
              firstName: item.user.first_name,
              lastName: item.user.last_name,
              email: item.user.email,
              designation: item.user.designation,
              profileImageUrl: item.user.profile_image_url,
              isLoggedInUser: false,
              level: item.user.level ? {
                id: item.user.level.id,
                name: item.user.level.name,
                color_code: item.user.level.color_code,
                rank: item.user.level.rank || 999
              } : undefined
            }));
        }
        
        // Add current user to team members
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            email,
            designation,
            profile_image_url,
            level:levels (
              id,
              name,
              color_code,
              rank
            )
          `)
          .eq('id', user.id)
          .single();
        
        if (currentUserError) {
          throw currentUserError;
        }
        
        if (currentUserData) {
          teamMembers.push({
            id: currentUserData.id,
            firstName: currentUserData.first_name,
            lastName: currentUserData.last_name,
            email: currentUserData.email,
            designation: currentUserData.designation,
            profileImageUrl: currentUserData.profile_image_url,
            isLoggedInUser: true,
            level: currentUserData.level ? {
              id: currentUserData.level.id,
              name: currentUserData.level.name,
              color_code: currentUserData.level.color_code,
              rank: currentUserData.level.rank || 999
            } : undefined
          });
        }
      }
      
      return {
        supervisor,
        teamMembers
      };
    },
    enabled: !!user?.id,
  });
  
  return {
    teamData,
    isLoading,
    error
  };
};
