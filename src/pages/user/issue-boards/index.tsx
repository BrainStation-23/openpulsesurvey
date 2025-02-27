
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
  
  const { data: boards, isLoading } = useQuery({
    queryKey: ['user-issue-boards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_boards')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          created_by,
          issue_board_permissions (
            can_view,
            can_create,
            can_vote
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      
      return data.map((board: any) => ({
        ...board,
        permissions: board.issue_board_permissions[0] || {
          can_view: false,
          can_create: false,
          can_vote: false
        }
      })) as UserIssueBoard[];
    }
  });

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
