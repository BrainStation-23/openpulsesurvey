
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CreateIssueButtonProps } from "../types";

export function CreateIssueButton({ 
  boardId, 
  onIssueCreated 
}: CreateIssueButtonProps) {
  return (
    <Button onClick={() => onIssueCreated?.()}>
      <Plus className="h-4 w-4 mr-2" />
      Create Issue
    </Button>
  );
}
