
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard } from "./types";

export default function UserIssueBoards() {
  const navigate = useNavigate();
  
  const { data: boards, isLoading, error } = useQuery({
    queryKey: ['user-issue-boards'],
    queryFn: async () => {
      console.log('Fetching issue boards...');
      
      const { data: boardsData, error: boardsError } = await supabase
        .from('issue_boards')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          created_by,
          issue_board_permissions!inner (
            can_view,
            can_create,
            can_vote,
            level_ids,
            location_ids,
            employment_type_ids,
            employee_type_ids,
            employee_role_ids,
            sbu_ids
          )
        `)
        .eq('status', 'active');

      if (boardsError) {
        console.error('Error fetching boards:', boardsError);
        throw boardsError;
      }

      console.log('Fetched boards:', boardsData);

      // Get current user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          level_id,
          location_id,
          employment_type_id,
          employee_type_id,
          employee_role_id,
          user_sbus (
            sbu_id
          )
        `)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Fetched user profile:', profile);

      // Filter boards based on user's attributes
      const filteredBoards = boardsData
        .filter(board => {
          const permissions = board.issue_board_permissions[0];
          console.log(`Checking permissions for board ${board.name}:`, permissions);
          
          if (!permissions) {
            console.log(`No permissions found for board ${board.name}`);
            return false;
          }

          // Check if arrays are null or empty (meaning everyone has access)
          const isEmptyOrNull = (arr?: any[]) => !arr || arr.length === 0;

          // Helper to check if user attribute matches or permission is open to all
          const checkAccess = (userValue: string | null | undefined, permissionArray?: string[], attributeName?: string) => {
            const hasAccess = isEmptyOrNull(permissionArray) || (userValue && permissionArray?.includes(userValue));
            console.log(`${attributeName} access check:`, { userValue, permissionArray, hasAccess });
            return hasAccess;
          };

          // Check access for each attribute
          const hasLevelAccess = checkAccess(profile.level_id, permissions.level_ids, 'Level');
          const hasLocationAccess = checkAccess(profile.location_id, permissions.location_ids, 'Location');
          const hasEmploymentTypeAccess = checkAccess(profile.employment_type_id, permissions.employment_type_ids, 'Employment Type');
          const hasEmployeeTypeAccess = checkAccess(profile.employee_type_id, permissions.employee_type_ids, 'Employee Type');
          const hasEmployeeRoleAccess = checkAccess(profile.employee_role_id, permissions.employee_role_ids, 'Employee Role');
          
          // Special check for SBU since it's an array of objects
          const hasSBUAccess = isEmptyOrNull(permissions.sbu_ids) || 
            profile.user_sbus?.some(us => permissions.sbu_ids?.includes(us.sbu_id));
          
          console.log('SBU access check:', {
            userSBUs: profile.user_sbus,
            permissionSBUs: permissions.sbu_ids,
            hasSBUAccess
          });

          // User needs to match at least one criteria
          const hasAccess = hasLevelAccess || hasLocationAccess || hasEmploymentTypeAccess || 
                         hasEmployeeTypeAccess || hasEmployeeRoleAccess || hasSBUAccess;
          
          console.log(`Final access decision for board ${board.name}:`, hasAccess);
          return hasAccess;
        })
        .map(board => {
          const mappedBoard = {
            id: board.id,
            name: board.name,
            description: board.description,
            status: board.status,
            created_at: board.created_at,
            created_by: board.created_by,
            permissions: {
              can_view: board.issue_board_permissions[0].can_view,
              can_create: board.issue_board_permissions[0].can_create,
              can_vote: board.issue_board_permissions[0].can_vote
            }
          };
          console.log('Mapped board:', mappedBoard);
          return mappedBoard;
        }) as UserIssueBoard[];

      console.log('Final filtered and mapped boards:', filteredBoards);
      return filteredBoards;
    }
  });

  console.log('Component render state:', { isLoading, error, boardsCount: boards?.length });

  if (error) {
    console.error('Query error:', error);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Issue Boards</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boards?.map((board) => (
          <Card 
            key={board.id} 
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{board.name}</h3>
            {board.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {board.description}
              </p>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {board.permissions.can_create && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Can Create
                  </span>
                )}
                {board.permissions.can_vote && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Can Vote
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/user/issue-boards/${board.id}`)}
              >
                View Board
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
        
        {(!boards || boards.length === 0) && (
          <Card className="p-6 col-span-full">
            <p className="text-center text-muted-foreground">
              No issue boards available.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
