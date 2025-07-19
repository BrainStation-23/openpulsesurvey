import React from "react";
import { Building, GraduationCap, BadgeCheck, Plus, Trash2, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import type { IssueBoard, IssueBoardPermission } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccessLevelGroup } from "./AccessLevelGroup";
import { PermissionRuleExplanation } from "./PermissionRuleExplanation";
import { usePermissionValidation } from "../hooks/usePermissionValidation";

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

  const { validatePermissions, enforcePermissionDependencies, validateRuleConflicts } = usePermissionValidation();

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
    const defaultPermission = {
      rule_name: `Rule ${newIndex + 1}`,
      rule_type: 'include' as const,
      priority: 100,
      is_active: true,
    };
    setPermissions([...permissions, defaultPermission]);
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
    newPermissions[index] = enforcePermissionDependencies({
      ...newPermissions[index],
      [field]: value
    });
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
    const errors = validatePermissions(permissions);
    const conflicts = validateRuleConflicts(permissions);
    
    const allErrors = [...errors, ...conflicts];
    if (allErrors.length > 0) {
      allErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }
    
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
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h4 className="font-medium">Permission Rule {index + 1}</h4>
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
               
               <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <AccessLevelGroup
                  title="Organization"
                  icon={<Building className="h-4 w-4" />}
                  selections={[
                    {
                      label: "Strategic Business Units",
                      options: sbus || [],
                      value: permission.sbu_ids || [],
                      onChange: (value) => updatePermission(index, 'sbu_ids', value)
                    },
                    {
                      label: "Locations",
                      options: locations || [],
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
                      options: levels || [],
                      value: permission.level_ids || [],
                      onChange: (value) => updatePermission(index, 'level_ids', value)
                    },
                    {
                      label: "Employee Roles",
                      options: employeeRoles || [],
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
                      options: employmentTypes || [],
                      value: permission.employment_type_ids || [],
                      onChange: (value) => updatePermission(index, 'employment_type_ids', value)
                    },
                    {
                      label: "Employee Types",
                      options: employeeTypes || [],
                      value: permission.employee_type_ids || [],
                      onChange: (value) => updatePermission(index, 'employee_type_ids', value)
                    }
                  ]}
                />
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
                              Users can create new issues on the board (requires View permission)
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
                               Users can vote on issues in the board (requires View permission)
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Rule Configuration */}
                 <div className="mt-4">
                   <h5 className="font-medium text-sm mb-3">Rule Configuration</h5>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                     <div className="space-y-2">
                       <Label htmlFor={`rule_name_${index}`} className="text-sm font-medium">
                         Rule Name
                       </Label>
                       <Input
                         id={`rule_name_${index}`}
                         value={permission.rule_name || ''}
                         onChange={(e) => updatePermission(index, 'rule_name', e.target.value)}
                         placeholder="Enter rule name"
                         className="text-sm"
                       />
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor={`rule_type_${index}`} className="text-sm font-medium">
                         Rule Type
                       </Label>
                       <Select
                         value={permission.rule_type || 'include'}
                         onValueChange={(value) => updatePermission(index, 'rule_type', value)}
                       >
                         <SelectTrigger id={`rule_type_${index}`} className="text-sm">
                           <SelectValue placeholder="Select type" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="include">Include</SelectItem>
                           <SelectItem value="exclude">Exclude</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor={`priority_${index}`} className="text-sm font-medium">
                         Priority
                       </Label>
                       <Input
                         id={`priority_${index}`}
                         type="number"
                         min={0}
                         max={1000}
                         value={permission.priority || 100}
                         onChange={(e) => updatePermission(index, 'priority', parseInt(e.target.value) || 100)}
                         className="text-sm"
                       />
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor={`is_active_${index}`} className="text-sm font-medium">
                         Active
                       </Label>
                       <div className="flex items-center space-x-2 mt-2">
                         <Checkbox
                           id={`is_active_${index}`}
                           checked={permission.is_active ?? true}
                           onCheckedChange={(checked) => updatePermission(index, 'is_active', checked)}
                         />
                         <label
                           htmlFor={`is_active_${index}`}
                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                         >
                           Enabled
                         </label>
                       </div>
                     </div>
                   </div>
                 </div>

                <PermissionRuleExplanation 
                  permission={permission}
                  index={index}
                />
              </div>
            </div>
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
