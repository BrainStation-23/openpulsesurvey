import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserSelector } from "./UserSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface AssignmentDialogProps {
  surveyId: string;
  campaignId: string;
}

export function AssignmentDialog({ surveyId, campaignId }: AssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error("No session found");

      const assignments = userIds.map(userId => ({
        survey_id: surveyId,
        user_id: userId,
        campaign_id: campaignId,
        created_by: session.user.id,
      }));

      const { error } = await supabase
        .from("survey_assignments")
        .insert(assignments);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
      toast({
        title: "Success",
        description: "Users have been assigned to the survey",
      });
      setOpen(false);
      setSelectedUsers([]);
    },
    onError: (error) => {
      console.error("Assignment error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign users to the survey",
      });
    },
  });

  const handleAssign = () => {
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one user",
      });
      return;
    }

    assignMutation.mutate(selectedUsers);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Users to Survey</DialogTitle>
        </DialogHeader>

        <UserSelector
          selectedUsers={selectedUsers}
          onChange={setSelectedUsers}
          campaignId={campaignId}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? "Assigning..." : "Assign Selected Users"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}