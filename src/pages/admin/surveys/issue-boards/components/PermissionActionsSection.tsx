import React from "react";
import { Eye, Edit, Vote, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { IssueBoardPermission } from "../types";

interface PermissionActionsSectionProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
  updatePermission: (index: number, field: keyof IssueBoardPermission, value: any) => void;
}

export function PermissionActionsSection({
  permission,
  index,
  updatePermission
}: PermissionActionsSectionProps) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
        <Shield className="h-4 w-4" />
        What can they do?
      </h4>
      <div className="space-y-3 p-4 bg-secondary/10 rounded-lg border">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`can_view_${index}`}
            checked={permission.can_view}
            onCheckedChange={(checked) => updatePermission(index, 'can_view', checked)}
          />
          <div className="flex items-center gap-2 flex-1">
            <Eye className="h-4 w-4" />
            <label
              htmlFor={`can_view_${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              View Issues
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id={`can_create_${index}`}
            checked={permission.can_create}
            onCheckedChange={(checked) => updatePermission(index, 'can_create', checked)}
          />
          <div className="flex items-center gap-2 flex-1">
            <Edit className="h-4 w-4" />
            <label
              htmlFor={`can_create_${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Create New Issues
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id={`can_vote_${index}`}
            checked={permission.can_vote}
            onCheckedChange={(checked) => updatePermission(index, 'can_vote', checked)}
          />
          <div className="flex items-center gap-2 flex-1">
            <Vote className="h-4 w-4" />
            <label
              htmlFor={`can_vote_${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Vote on Issues
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}