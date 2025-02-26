
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { IssueBoardTabs } from "../components/IssueBoardTabs";
import { supabase } from "@/integrations/supabase/client";
import type { IssueBoard, IssueBoardPermission } from "../types";

export default function EditIssueBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: board, isLoading: isBoardLoading } = useQuery({
    queryKey: ['issueBoard', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_boards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as IssueBoard;
    },
  });

  const { data: permissions, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ['issueBoardPermissions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_board_permissions')
        .select('*')
        .eq('board_id', id);

      if (error) throw error;
      return data as IssueBoardPermission[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ 
      values, 
      permissions 
    }: { 
      values: Partial<IssueBoard>, 
      permissions: Partial<IssueBoardPermission>[] 
    }) => {
      // Update board
      const { error: boardError } = await supabase
        .from('issue_boards')
        .update({
          name: values.name,
          description: values.description,
          status: values.status,
        })
        .eq('id', id);

      if (boardError) throw boardError;

      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('issue_board_permissions')
        .delete()
        .eq('board_id', id);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('issue_board_permissions')
          .insert(
            permissions.map(permission => ({
              ...permission,
              board_id: id
            }))
          );

        if (permissionsError) throw permissionsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueBoard', id] });
      queryClient.invalidateQueries({ queryKey: ['issueBoardPermissions', id] });
      toast({
        title: "Success",
        description: "Board updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update board: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: Partial<IssueBoard>, permissions: Partial<IssueBoardPermission>[]) => {
    updateMutation.mutate({ values, permissions });
  };

  if (isBoardLoading || isPermissionsLoading) {
    return <div>Loading...</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/admin/surveys/issue-boards")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Issue Board</h1>
      </div>

      <IssueBoardTabs
        mode="edit"
        board={board}
        initialPermissions={permissions || []}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
