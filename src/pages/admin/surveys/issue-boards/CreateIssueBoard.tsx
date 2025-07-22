
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: Partial<IssueBoard>, permissions: Partial<IssueBoardPermission>[]) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error("User not authenticated");
      }

      // Insert the board
      const { data: board, error: boardError } = await supabase
        .from('issue_boards')
        .insert({
          name: values.name!,
          description: values.description || null,
          status: values.status || 'active',
          created_by: user.data.user.id,
        })
        .select()
        .single();

      if (boardError) throw boardError;

      // Insert permissions if any exist
      if (permissions.length > 0) {
        const validPermissions = permissions.filter(permission => 
          permission.rule_name && permission.rule_name.trim() !== ""
        );

        if (validPermissions.length > 0) {
          const { error: permissionsError } = await supabase
            .from('issue_board_permissions')
            .insert(
              validPermissions.map(permission => ({
                board_id: board.id,
                rule_name: permission.rule_name,
                rule_type: permission.rule_type || 'include',
                priority: permission.priority || 100,
                is_active: permission.is_active !== false,
                sbu_ids: permission.sbu_ids || null,
                level_ids: permission.level_ids || null,
                location_ids: permission.location_ids || null,
                employment_type_ids: permission.employment_type_ids || null,
                employee_type_ids: permission.employee_type_ids || null,
                employee_role_ids: permission.employee_role_ids || null,
                can_view: permission.can_view || false,
                can_create: permission.can_create || false,
                can_vote: permission.can_vote || false,
              }))
            );

          if (permissionsError) throw permissionsError;
        }
      }

      toast({
        title: "Success",
        description: "Board created successfully",
      });
      
      navigate(`/admin/surveys/issue-boards/${board.id}`);
    } catch (error: any) {
      console.error("Error creating board:", error);
      toast({
        title: "Error",
        description: "Failed to create board: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/admin/surveys/issue-boards")}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Issue Board</h1>
          <p className="text-muted-foreground">
            Set up a new board for collecting and managing user feedback
          </p>
        </div>
      </div>

      <IssueBoardTabs 
        mode="create"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
