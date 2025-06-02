
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

export interface DirectReport {
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
  directReports: DirectReport[];
  error?: string;
}

interface TeamDataResponse {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
  directReports: DirectReport[];
  error?: string;
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
        console.error('useTeamData: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching team data for user:', user.id);
      
      try {
        // Call the RPC function directly using supabase client
        const { data, error } = await supabase.rpc('get_team_data', {
          p_user_id: user.id
        });
        
        if (error) {
          console.error('RPC get_team_data error:', error);
          throw error;
        }
        
        if (!data) {
          console.error('No data returned from get_team_data RPC');
          throw new Error('No data returned from RPC function');
        }
        
        console.log('Team data received from RPC:', data);
        
        // Parse the JSON response
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Check if there's an error in the returned data
        if (parsedData.error) {
          console.error('Database error in get_team_data:', parsedData.error);
          throw new Error(`Database error: ${parsedData.error}`);
        }
        
        // Transform the data to match our interface
        const result: TeamData = {
          supervisor: parsedData.supervisor,
          teamMembers: parsedData.teamMembers || [],
          directReports: parsedData.directReports || []
        };
        
        console.log('Processed team data:', result);
        
        return result;
        
      } catch (err) {
        console.error('Error in useTeamData queryFn:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
  });
  
  return {
    teamData,
    isLoading,
    error
  };
};
