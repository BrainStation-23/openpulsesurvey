
import React from "react";
import type { IssueBoardPermission } from "../types";

interface PermissionRuleExplanationProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
}

export function PermissionRuleExplanation({ permission, index }: PermissionRuleExplanationProps) {
  const getSelectionSummary = () => {
    const counts = {
      sbus: permission.sbu_ids?.length || 0,
      levels: permission.level_ids?.length || 0,
      locations: permission.location_ids?.length || 0,
      employmentTypes: permission.employment_type_ids?.length || 0,
      employeeTypes: permission.employee_type_ids?.length || 0,
      employeeRoles: permission.employee_role_ids?.length || 0,
    };

    if (Object.values(counts).every(count => count === 0)) {
      return "This rule applies to no one since no groups are selected.";
    }

    const selectedGroups = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => `${count} ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`);

    const permissions = [
      permission.can_view && "view issues",
      permission.can_create && "create new issues",
      permission.can_vote && "vote on issues"
    ].filter(Boolean);

    return `Users from ${selectedGroups.join(", ")} will be able to ${permissions.join(", ")}.`;
  };

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Rule {index + 1} Impact: </span>
        {getSelectionSummary()}
      </p>
    </div>
  );
}
