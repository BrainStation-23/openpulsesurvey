
import React from 'react';
import { useTeamData } from '@/hooks/useTeamData';
import { TeamGraphView } from '@/components/team/TeamGraphView';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function MyTeamPage() {
  const { user } = useCurrentUser();
  const { teamData, isLoading, error } = useTeamData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">
            Welcome to Your Team View
          </h2>
          <p className="text-muted-foreground">
            This page shows your supervisor and colleagues who share the same supervisor.
            The organizational structure is represented as a graph where connections show
            reporting relationships.
          </p>
        </CardContent>
      </Card>

      <TeamGraphView
        supervisor={teamData?.supervisor || null}
        teamMembers={teamData?.teamMembers || []}
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
                            <span className="ml-2 text-xs text-blue-500 font-medium">(You)</span>
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

      {teamData?.supervisor && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Supervisor</h2>
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
}
