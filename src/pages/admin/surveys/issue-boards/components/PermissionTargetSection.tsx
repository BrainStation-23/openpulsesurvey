import React from "react";
import { Building, GraduationCap, BadgeCheck, Users } from "lucide-react";
import { AccessLevelGroup } from "./AccessLevelGroup";
import type { IssueBoardPermission } from "../types";
import type { UsePermissionDataReturn } from "../hooks/usePermissionData";

interface PermissionTargetSectionProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
  updatePermission: (index: number, field: keyof IssueBoardPermission, value: any) => void;
  permissionData: UsePermissionDataReturn;
}

export function PermissionTargetSection({
  permission,
  index,
  updatePermission,
  permissionData
}: PermissionTargetSectionProps) {
  const { sbus, levels, locations, employmentTypes, employeeTypes, employeeRoles } = permissionData;

  return (
    <div>
      <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Who does this rule apply to?
      </h4>
      
      <div className="space-y-4">
        <AccessLevelGroup
          title="Organization"
          icon={<Building className="h-4 w-4" />}
          selections={[
            {
              label: "Strategic Business Units",
              options: sbus,
              value: permission.sbu_ids || [],
              onChange: (value) => updatePermission(index, 'sbu_ids', value)
            },
            {
              label: "Locations",
              options: locations,
              value: permission.location_ids || [],
              onChange: (value) => updatePermission(index, 'location_ids', value)
            }
          ]}
        />

        <AccessLevelGroup
          title="Position"
          icon={<GraduationCap className="h-4 w-4" />}
          selections={[
            {
              label: "Levels",
              options: levels,
              value: permission.level_ids || [],
              onChange: (value) => updatePermission(index, 'level_ids', value)
            },
            {
              label: "Employee Roles",
              options: employeeRoles,
              value: permission.employee_role_ids || [],
              onChange: (value) => updatePermission(index, 'employee_role_ids', value)
            }
          ]}
        />

        <AccessLevelGroup
          title="Employment"
          icon={<BadgeCheck className="h-4 w-4" />}
          selections={[
            {
              label: "Employment Types",
              options: employmentTypes,
              value: permission.employment_type_ids || [],
              onChange: (value) => updatePermission(index, 'employment_type_ids', value)
            },
            {
              label: "Employee Types",
              options: employeeTypes,
              value: permission.employee_type_ids || [],
              onChange: (value) => updatePermission(index, 'employee_type_ids', value)
            }
          ]}
        />
      </div>
    </div>
  );
}