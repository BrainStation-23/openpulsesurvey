
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [expandedRules, setExpandedRules] = React.useState<Record<number, boolean>>(
    Object.fromEntries(permissions.map((_, i) => [i, true]))
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
    const newIndex = permissions.length;
    setPermissions([...permissions, {}]);
    setExpandedRules(prev => ({ ...prev, [newIndex]: true }));
  };

  const duplicatePermission = (index: number) => {
    const newPermission = { ...permissions[index] };
    setPermissions([...permissions, newPermission]);
    setExpandedRules(prev => ({ ...prev, [permissions.length]: true }));
  };

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
    setExpandedRules(prev => {
      const { [index]: _, ...rest } = prev;
      return rest;
    });
  };

  const updatePermission = (index: number, field: keyof IssueBoardPermission, value: any) => {
    const newPermissions = [...permissions];
    newPermissions[index] = {
      ...newPermissions[index],
      [field]: value
    };
    setPermissions(newPermissions);
  };

  const toggleRule = (index: number) => {
    setExpandedRules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(permissions);
  };

  const getSelectionSummary = (permission: Partial<IssueBoardPermission>) => {
    const counts = {
      sbus: permission.sbu_ids?.length || 0,
      levels: permission.level_ids?.length || 0,
      locations: permission.location_ids?.length || 0,
      employmentTypes: permission.employment_type_ids?.length || 0,
      employeeTypes: permission.employee_type_ids?.length || 0,
      employeeRoles: permission.employee_role_ids?.length || 0,
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => `${count} ${key.replace(/([A-Z])/g, ' $1').trim()}`)
      .join(' | ');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <Card key={index} className="p-4 relative">
            <Collapsible open={expandedRules[index]} onOpenChange={() => toggleRule(index)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {expandedRules[index] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <h4 className="font-medium">Permission Rule {index + 1}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicatePermission(index)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate rule</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {permissions.length > 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePermission(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove rule</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              <CollapsibleContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-sm mb-3">Access Level</h5>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
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
                    </ScrollArea>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="font-medium text-sm mb-3">Permissions</h5>
                      <div className="space-y-4 bg-secondary/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`can_view_${index}`}
                            checked={permission.can_view}
                            onCheckedChange={(checked) => updatePermission(index, 'can_view', checked)}
                          />
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`can_view_${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Can View
                            </label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Users can view the board and its issues
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`can_create_${index}`}
                            checked={permission.can_create}
                            onCheckedChange={(checked) => updatePermission(index, 'can_create', checked)}
                          />
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`can_create_${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Can Create
                            </label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Users can create new issues on the board
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`can_vote_${index}`}
                            checked={permission.can_vote}
                            onCheckedChange={(checked) => updatePermission(index, 'can_vote', checked)}
                          />
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`can_vote_${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Can Vote
                            </label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Users can vote on issues in the board
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Selection Summary</h5>
                      <div className="bg-secondary/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {getSelectionSummary(permission) || 'No selections made'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {!expandedRules[index] && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {permission.can_view && (
                    <Badge variant="secondary">Can View</Badge>
                  )}
                  {permission.can_create && (
                    <Badge variant="secondary">Can Create</Badge>
                  )}
                  {permission.can_vote && (
                    <Badge variant="secondary">Can Vote</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {getSelectionSummary(permission) || 'No selections made'}
                </p>
              </div>
            )}
          </Card>
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
