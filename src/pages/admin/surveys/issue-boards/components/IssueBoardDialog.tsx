
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IssueBoardForm } from "./IssueBoardForm";
import type { IssueBoard } from "../types";

type IssueBoardFormValues = {
  name: string;
  description?: string;
  status: 'active' | 'disabled';
};

interface IssueBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: IssueBoardFormValues) => void;
  initialValues?: Partial<IssueBoardFormValues>;
  mode: "create" | "edit";
}

export function IssueBoardDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  mode
}: IssueBoardDialogProps) {
  const [formData, setFormData] = React.useState<Partial<IssueBoard>>(initialValues || {});

  const handleSubmit = () => {
    onSubmit(formData as IssueBoardFormValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Issue Board" : "Edit Issue Board"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <IssueBoardForm
            values={formData}
            onChange={setFormData}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {mode === "create" ? "Create Board" : "Save Changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
