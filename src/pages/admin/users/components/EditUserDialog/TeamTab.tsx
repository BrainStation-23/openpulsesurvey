
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamGraphView } from '@/components/team/TeamGraphView';
import { Card, CardContent } from '@/components/ui/card';
import { TeamData } from '@/hooks/useTeamData';

interface TeamTabProps {
  userId: string;
}

export const TeamTab: React.FC<TeamTabProps> = ({ userId }) => {
  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team-data', userId],
    queryFn: async (): Promise<TeamData> => {
      if (!userId) {
        console.error('TeamTab: No userId provided');
        throw new Error('No userId provided');
      }
      
      console.log('Fetching team data for user:', userId);
      
      try {
        // Call the RPC function directly using supabase client
        const { data, error } = await supabase.rpc('get_team_data', {
          p_user_id: userId
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
        
        console.log('Processed team data successfully');
        
        return result;
        
      } catch (err) {
        console.error('Error in TeamTab queryFn:', err);
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2 text-red-600">
              Error Loading Team Data
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred while loading team data.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">
            Team View
          </h2>
          <p className="text-muted-foreground">
            This shows the user's supervisor, colleagues who share the same supervisor, and people they supervise.
            The organizational structure is represented as a graph where connections show
            reporting relationships.
          </p>
        </CardContent>
      </Card>

      <TeamGraphView
        supervisor={teamData?.supervisor || null}
        teamMembers={teamData?.teamMembers || []}
        directReports={teamData?.directReports || []}
        isLoading={isLoading}
        error={error as Error}
      />

      {teamData && teamData.teamMembers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.teamMembers.map((member) => (
                <Card key={member.id} className={`overflow-hidden ${member.isLoggedInUser ? 'border-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {member.firstName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                          {member.isLoggedInUser && (
                            <span className="ml-2 text-xs text-blue-500 font-medium">(This User)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.designation || member.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {teamData?.directReports && teamData.directReports.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Direct Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.directReports.map((report) => (
                <Card key={report.id} className="overflow-hidden border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {report.profileImageUrl ? (
                        <img
                          src={report.profileImageUrl}
                          alt={`${report.firstName} ${report.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">
                          {report.firstName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {report.firstName} {report.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{report.designation || report.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {teamData?.supervisor && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Supervisor</h2>
            <div className="flex items-center gap-4">
              {teamData.supervisor.profileImageUrl ? (
                <img
                  src={teamData.supervisor.profileImageUrl}
                  alt={`${teamData.supervisor.firstName} ${teamData.supervisor.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  {teamData.supervisor.firstName.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">
                  {teamData.supervisor.firstName} {teamData.supervisor.lastName}
                </div>
                <div className="text-muted-foreground">
                  {teamData.supervisor.designation || teamData.supervisor.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
