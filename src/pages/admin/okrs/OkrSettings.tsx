
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmployeeRoleSelector } from '@/components/okr/permissions/EmployeeRoleSelector';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OkrRoleSettings {
  id: string;
  can_create_objectives: string[];
  can_create_org_objectives: string[];
  can_create_dept_objectives: string[];
  can_create_team_objectives: string[];
  can_create_key_results: string[];
  can_create_alignments: string[];
  can_align_with_org_objectives: string[];
  can_align_with_dept_objectives: string[];
  can_align_with_team_objectives: string[];
}

const OkrSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("objective-creation");
  const [allowAll, setAllowAll] = useState<Record<string, boolean>>({
    can_create_objectives: false,
    can_create_org_objectives: false,
    can_create_dept_objectives: false,
    can_create_team_objectives: false,
    can_create_key_results: false,
    can_create_alignments: false,
    can_align_with_org_objectives: false,
    can_align_with_dept_objectives: false,
    can_align_with_team_objectives: false,
  });

  // Fetch OKR role settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['okr-role-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_role_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as OkrRoleSettings;
    }
  });

  // Fetch employee roles for reference
  const { data: employeeRoles } = useQuery({
    queryKey: ['employee-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<OkrRoleSettings>) => {
      const { data, error } = await supabase
        .from('okr_role_settings')
        .update(updatedSettings)
        .eq('id', settings?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-role-settings'] });
      toast({
        title: "Settings Updated",
        description: "OKR permission settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Settings Update Failed",
        description: `Failed to update settings: ${error.message}`,
      });
    }
  });

  // Set up the allowAll switches based on empty arrays
  useEffect(() => {
    if (settings) {
      const newAllowAll: Record<string, boolean> = {};
      
      Object.entries(settings).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          newAllowAll[key] = value.length === 0;
        }
      });
      
      setAllowAll(newAllowAll);
    }
  }, [settings]);

  // Handle role selection changes
  const handleRoleSelectionChange = (field: keyof OkrRoleSettings, selectedRoles: string[]) => {
    if (!settings) return;
    
    updateSettingsMutation.mutate({
      [field]: selectedRoles
    });
  };

  // Handle allow all toggle changes
  const handleAllowAllToggle = (field: keyof OkrRoleSettings, checked: boolean) => {
    setAllowAll(prev => ({ ...prev, [field]: checked }));
    
    // If toggle is turned on, set empty array (all roles allowed)
    // If toggle is turned off, set to empty array initially
    updateSettingsMutation.mutate({
      [field]: []
    });
  };

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">OKR Permission Settings</h1>
        <p className="text-muted-foreground">
          Configure which employee roles can create and manage OKRs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="objective-creation">Objective Creation</TabsTrigger>
          <TabsTrigger value="key-results">Key Results</TabsTrigger>
          <TabsTrigger value="alignments">Alignments</TabsTrigger>
        </TabsList>

        {/* Objective Creation Tab */}
        <TabsContent value="objective-creation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objective Creation Permissions</CardTitle>
              <CardDescription>
                Control which employee roles can create objectives and at what visibility levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General objective creation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">General Objective Creation</h3>
                    <p className="text-sm text-muted-foreground">Who can create objectives in general</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-objectives" 
                      checked={allowAll.can_create_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-objectives">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_objectives', roles)}
                    placeholder="Select roles that can create objectives..."
                  />
                )}
              </div>

              {/* Organization-level objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Organization-level Objectives</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can create objectives with organization-wide visibility
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-org" 
                      checked={allowAll.can_create_org_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_org_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-org">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_org_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_org_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_org_objectives', roles)}
                    placeholder="Select roles that can create organization objectives..."
                  />
                )}
              </div>

              {/* Department-level objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Department-level Objectives</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can create objectives with department-wide visibility
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-dept" 
                      checked={allowAll.can_create_dept_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_dept_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-dept">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_dept_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_dept_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_dept_objectives', roles)}
                    placeholder="Select roles that can create department objectives..."
                  />
                )}
              </div>

              {/* Team-level objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Team-level Objectives</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can create objectives with team-wide visibility
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-team" 
                      checked={allowAll.can_create_team_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_team_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-team">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_team_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_team_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_team_objectives', roles)}
                    placeholder="Select roles that can create team objectives..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Results Tab */}
        <TabsContent value="key-results">
          <Card>
            <CardHeader>
              <CardTitle>Key Results Permissions</CardTitle>
              <CardDescription>
                Control which employee roles can create key results for objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Key Results Creation</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can add key results to objectives (in addition to objective owners)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-kr" 
                      checked={allowAll.can_create_key_results}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_key_results', checked)}
                    />
                    <Label htmlFor="allow-all-kr">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_key_results && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_key_results || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_key_results', roles)}
                    placeholder="Select roles that can create key results..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alignments Tab */}
        <TabsContent value="alignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alignment Permissions</CardTitle>
              <CardDescription>
                Control which employee roles can create alignments between objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General alignment creation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">General Alignment Creation</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can create alignments between objectives
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-alignments" 
                      checked={allowAll.can_create_alignments}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_create_alignments', checked)}
                    />
                    <Label htmlFor="allow-all-alignments">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_create_alignments && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_create_alignments || []}
                    onChange={(roles) => handleRoleSelectionChange('can_create_alignments', roles)}
                    placeholder="Select roles that can create alignments..."
                  />
                )}
              </div>

              {/* Align with organization objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Organization Objective Alignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can align with organization-level objectives
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-align-org" 
                      checked={allowAll.can_align_with_org_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_align_with_org_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-align-org">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_align_with_org_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_align_with_org_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_align_with_org_objectives', roles)}
                    placeholder="Select roles that can align with organization objectives..."
                  />
                )}
              </div>

              {/* Align with department objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Department Objective Alignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can align with department-level objectives
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-align-dept" 
                      checked={allowAll.can_align_with_dept_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_align_with_dept_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-align-dept">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_align_with_dept_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_align_with_dept_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_align_with_dept_objectives', roles)}
                    placeholder="Select roles that can align with department objectives..."
                  />
                )}
              </div>

              {/* Align with team objectives */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Team Objective Alignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Who can align with team-level objectives
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-all-align-team" 
                      checked={allowAll.can_align_with_team_objectives}
                      onCheckedChange={(checked) => handleAllowAllToggle('can_align_with_team_objectives', checked)}
                    />
                    <Label htmlFor="allow-all-align-team">Allow all roles</Label>
                  </div>
                </div>
                {!allowAll.can_align_with_team_objectives && (
                  <EmployeeRoleSelector
                    selectedRoles={settings?.can_align_with_team_objectives || []}
                    onChange={(roles) => handleRoleSelectionChange('can_align_with_team_objectives', roles)}
                    placeholder="Select roles that can align with team objectives..."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OkrSettings;
