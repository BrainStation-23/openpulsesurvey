import React from "react";
import { Building, GraduationCap, BadgeCheck, Plus, Trash2, Copy, Info, ChevronDown, ChevronRight, Users, Shield, Settings, Eye, Edit, Vote, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    Object.fromEntries(permissions.map((_, i) => [i, false])) // Start collapsed for better UX
  );
  const [activeStep, setActiveStep] = React.useState<'overview' | 'rules'>('overview');

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

    const totalSelected = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalSelected === 0) return "No criteria selected";
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => `${count} ${key.replace(/([A-Z])/g, ' $1').trim()}`)
      .join(' • ');
  };

  const getPermissionsSummary = (permission: Partial<IssueBoardPermission>) => {
    const activePermissions = [];
    if (permission.can_view) activePermissions.push("View");
    if (permission.can_create) activePermissions.push("Create");
    if (permission.can_vote) activePermissions.push("Vote");
    
    return activePermissions.length > 0 ? activePermissions.join(" • ") : "No permissions";
  };

  const getTotalUsersAffected = () => {
    // This would calculate estimated users affected by all rules
    return permissions.reduce((sum, permission) => {
      const criteria = [
        permission.sbu_ids?.length || 0,
        permission.level_ids?.length || 0,
        permission.location_ids?.length || 0,
      ].filter(count => count > 0);
      return sum + (criteria.length > 0 ? Math.min(criteria.reduce((a, b) => a * b, 1), 1000) : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Board Access Control
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define who can access "{board.name}" and what they can do
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{getTotalUsersAffected()}</span>
            <span className="text-muted-foreground">estimated users</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{permissions.length}</span>
            <span className="text-muted-foreground">rules active</span>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          type="button"
          variant={activeStep === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveStep('overview')}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          type="button"
          variant={activeStep === 'rules' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveStep('rules')}
          className="flex-1"
        >
          Configure Rules
        </Button>
      </div>

      {/* Overview Step */}
      {activeStep === 'overview' && (
        <div className="space-y-6">
          {permissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Access Rules Configured</h3>
                <p className="text-muted-foreground mb-4">
                  This board is currently inaccessible to all users. Create your first access rule to get started.
                </p>
                <Button onClick={() => {
                  addPermission();
                  setActiveStep('rules');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {permissions.map((permission, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {permission.rule_type === 'exclude' ? (
                            <Badge variant="destructive" className="text-xs">EXCLUDE</Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">INCLUDE</Badge>
                          )}
                          {permission.rule_name || `Rule ${index + 1}`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getSelectionSummary(permission)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Priority: {permission.priority || 100}
                        </Badge>
                        {!(permission.is_active ?? true) && (
                          <Badge variant="secondary" className="text-xs">Disabled</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className={permission.can_view ? "text-green-600" : "text-muted-foreground"}>
                            {permission.can_view ? "View" : "No View"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          <span className={permission.can_create ? "text-green-600" : "text-muted-foreground"}>
                            {permission.can_create ? "Create" : "No Create"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Vote className="h-3 w-3" />
                          <span className={permission.can_vote ? "text-green-600" : "text-muted-foreground"}>
                            {permission.can_vote ? "Vote" : "No Vote"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveStep('rules');
                          setExpandedRules(prev => ({ ...prev, [index]: true }));
                        }}
                      >
                        Edit Rule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {permissions.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  addPermission();
                  setActiveStep('rules');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Rule
              </Button>
              <Button
                onClick={() => setActiveStep('rules')}
              >
                Configure Rules
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Rules Configuration Step */}
      {activeStep === 'rules' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {permissions.map((permission, index) => (
              <Card key={index} className="overflow-hidden">
                <Collapsible
                  open={expandedRules[index]}
                  onOpenChange={(open) => toggleRule(index)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {expandedRules[index] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <CardTitle className="text-base">
                              {permission.rule_name || `Rule ${index + 1}`}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {permission.rule_type === 'exclude' ? (
                              <Badge variant="destructive" className="text-xs">EXCLUDE</Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">INCLUDE</Badge>
                            )}
                            {!(permission.is_active ?? true) && (
                              <Badge variant="secondary" className="text-xs">Disabled</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                      {!expandedRules[index] && (
                        <CardDescription className="mt-2">
                          {getSelectionSummary(permission)} • {getPermissionsSummary(permission)}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Target Criteria */}
                        <div className="space-y-6">
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
                          </div>
                        </div>

                        {/* Right Column - Permissions & Settings */}
                        <div className="space-y-6">
                          {/* Permissions */}
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

                          {/* Rule Configuration */}
                          <div>
                            <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Rule Settings
                            </h4>
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`rule_name_${index}`} className="text-sm font-medium">
                                    Rule Name
                                  </Label>
                                  <Input
                                    id={`rule_name_${index}`}
                                    value={permission.rule_name || ''}
                                    onChange={(e) => updatePermission(index, 'rule_name', e.target.value)}
                                    placeholder={`Rule ${index + 1}`}
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
                                      <SelectItem value="include">Include - Grant Access</SelectItem>
                                      <SelectItem value="exclude">Exclude - Deny Access</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`priority_${index}`} className="text-sm font-medium">
                                    Priority (0-1000)
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
                                  <Label className="text-sm font-medium">Status</Label>
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
                                      Rule is Active
                                    </label>
                                  </div>
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
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addPermission}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Permission Rule
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveStep('overview')}
              >
                Back to Overview
              </Button>
              <Button type="submit">
                Save All Rules
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}