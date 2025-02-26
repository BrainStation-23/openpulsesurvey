
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { IssueBoardTabs } from "./components/IssueBoardTabs";
import { supabase } from "@/integrations/supabase/client";
import type { IssueBoard, IssueBoardPermission } from "./types";

export default function CreateIssueBoard() {
  const navigate = useNavigate();

  const handleSubmit = async (values: Partial<IssueBoard>, permissions: Partial<IssueBoardPermission>[]) => {
    try {
      const user = await supabase.auth.getUser();
      
      // Insert the board
      const { data: board, error: boardError } = await supabase
        .from('issue_boards')
        .insert({
          name: values.name,
          description: values.description,
          status: values.status || 'active',
          created_by: user.data.user!.id,
        })
        .select()
        .single();

      if (boardError) throw boardError;

      // Insert permissions
      if (permissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('issue_board_permissions')
          .insert(
            permissions.map(permission => ({
              ...permission,
              board_id: board.id
            }))
          );

        if (permissionsError) throw permissionsError;
      }

      toast({
        title: "Success",
        description: "Board created successfully",
      });
      
      navigate(`/admin/surveys/issue-boards/${board.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create board: " + error.message,
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-2xl font-bold">Create Issue Board</h1>
      </div>

      <IssueBoardTabs 
        mode="create"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
