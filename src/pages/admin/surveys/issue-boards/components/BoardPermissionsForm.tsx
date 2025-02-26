
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { IssueBoard, IssueBoardPermission } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface BoardPermissionsFormProps {
  board: IssueBoard;
  onSubmit: (permissions: Partial<IssueBoardPermission>[]) => void;
  initialPermissions: IssueBoardPermission[];
}

export function BoardPermissionsForm({
  board,
  onSubmit,
  initialPermissions
}: BoardPermissionsFormProps) {
  const [permissions, setPermissions] = React.useState<Partial<IssueBoardPermission>[]>(
    initialPermissions.length > 0 ? initialPermissions : [{}]
  );

  // Fetch all the available options
  const { data: sbus } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data } = await supabase.from('sbus').select('id, name');
      return data || [];
    }
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await supabase.from('levels').select('id, name');
      return data || [];
    }
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await supabase.from('locations').select('id, name');
      return data || [];
    }
  });

  const { data: employmentTypes } = useQuery({
    queryKey: ['employmentTypes'],
    queryFn: async () => {
      const { data } = await supabase.from('employment_types').select('id, name');
      return data || [];
    }
  });

  const { data: employeeTypes } = useQuery({
    queryKey: ['employeeTypes'],
    queryFn: async () => {
      const { data } = await supabase.from('employee_types').select('id, name');
      return data || [];
    }
  });

  const { data: employeeRoles } = useQuery({
    queryKey: ['employeeRoles'],
    queryFn: async () => {
      const { data } = await supabase.from('employee_roles').select('id, name');
      return data || [];
    }
  });

  const addPermission = () => {
    setPermissions([...permissions, {}]);
  };

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  const updatePermission = (index: number, field: keyof IssueBoardPermission, value: any) => {
    const newPermissions = [...permissions];
    newPermissions[index] = {
      ...newPermissions[index],
      [field]: value
    };
    setPermissions(newPermissions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(permissions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Permission Rule {index + 1}</h4>
              {permissions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePermission(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <MultiSelectDropdown
                options={sbus || []}
                value={permission.sbu_ids || []}
                onChange={(value) => updatePermission(index, 'sbu_ids', value)}
                placeholder="Select SBUs"
                label="Strategic Business Units"
              />

              <MultiSelectDropdown
                options={levels || []}
                value={permission.level_ids || []}
                onChange={(value) => updatePermission(index, 'level_ids', value)}
                placeholder="Select Levels"
                label="Levels"
              />

              <MultiSelectDropdown
                options={locations || []}
                value={permission.location_ids || []}
                onChange={(value) => updatePermission(index, 'location_ids', value)}
                placeholder="Select Locations"
                label="Locations"
              />

              <MultiSelectDropdown
                options={employmentTypes || []}
                value={permission.employment_type_ids || []}
                onChange={(value) => updatePermission(index, 'employment_type_ids', value)}
                placeholder="Select Employment Types"
                label="Employment Types"
              />

              <MultiSelectDropdown
                options={employeeTypes || []}
                value={permission.employee_type_ids || []}
                onChange={(value) => updatePermission(index, 'employee_type_ids', value)}
                placeholder="Select Employee Types"
                label="Employee Types"
              />

              <MultiSelectDropdown
                options={employeeRoles || []}
                value={permission.employee_role_ids || []}
                onChange={(value) => updatePermission(index, 'employee_role_ids', value)}
                placeholder="Select Employee Roles"
                label="Employee Roles"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`can_view_${index}`}
                  checked={permission.can_view}
                  onCheckedChange={(checked) => updatePermission(index, 'can_view', checked)}
                />
                <label
                  htmlFor={`can_view_${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can View
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`can_create_${index}`}
                  checked={permission.can_create}
                  onCheckedChange={(checked) => updatePermission(index, 'can_create', checked)}
                />
                <label
                  htmlFor={`can_create_${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can Create
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`can_vote_${index}`}
                  checked={permission.can_vote}
                  onCheckedChange={(checked) => updatePermission(index, 'can_vote', checked)}
                />
                <label
                  htmlFor={`can_vote_${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can Vote
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addPermission}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Permission Rule
        </Button>
        <Button type="submit">Save Permissions</Button>
      </div>
    </form>
  );
}
