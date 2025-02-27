
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, ThumbsUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserIssueBoard, Issue } from "./types";

export default function IssueBoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: board, isLoading: isBoardLoading } = useQuery({
    queryKey: ['issue-board', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_boards')
        .select(`
          *,
          issue_board_permissions (
            can_view,
            can_create,
            can_vote
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        permissions: data.issue_board_permissions[0] || {
          can_view: false,
          can_create: false,
          can_vote: false
        }
      } as UserIssueBoard;
    }
  });

  const { data: issues, isLoading: isIssuesLoading } = useQuery({
    queryKey: ['board-issues', id],
    queryFn: async () => {
      // First get all issues
      const { data: issues, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .eq('board_id', id)
        .order('vote_count', { ascending: false });

      if (issuesError) throw issuesError;

      // Then get user's votes
      const { data: userVotes, error: votesError } = await supabase
        .from('issue_votes')
        .select('issue_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (votesError) throw votesError;

      const votedIssueIds = new Set(userVotes?.map(vote => vote.issue_id));

      return issues.map(issue => ({
        ...issue,
        has_voted: votedIssueIds.has(issue.id)
      })) as Issue[];
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const { error } = await supabase
        .from('issue_votes')
        .insert({
          issue_id: issueId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', id] });
      toast({
        title: "Success",
        description: "Your vote has been recorded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to vote: " + error.message,
        variant: "destructive",
      });
    }
  });

  if (isBoardLoading || isIssuesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div>Loading...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container mx-auto p-6">
        <div>Board not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/user/issue-boards")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{board.name}</h1>
      </div>

      {board.description && (
        <p className="text-muted-foreground">{board.description}</p>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Issues</h2>
        {board.permissions.can_create && (
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {issues?.map((issue) => (
          <Card key={issue.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{issue.title}</h3>
                {issue.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {issue.description}
                  </p>
                )}
              </div>
              {board.permissions.can_vote && (
                <Button
                  variant={issue.has_voted ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => !issue.has_voted && voteMutation.mutate(issue.id)}
                  disabled={issue.has_voted}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {issue.vote_count}
                </Button>
              )}
            </div>
          </Card>
        ))}

        {(!issues || issues.length === 0) && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No issues have been created yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
