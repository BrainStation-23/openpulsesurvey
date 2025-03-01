
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Issue } from "../../../types";

interface CardActionsProps {
  issue: Issue;
  onEdit: () => void;
}

export function CardActions({ issue, onEdit }: CardActionsProps) {
  const queryClient = useQueryClient();

  const deleteIssueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issue.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-issues', issue.board_id] });
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete issue: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-1 flex-shrink-0">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Edit2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => deleteIssueMutation.mutate()}
        disabled={deleteIssueMutation.isPending}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
}
