
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EmployeeRole {
  id: string;
  name: string;
  color_code?: string;
  status: 'active' | 'inactive';
  description?: string;
}

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

export default function OkrSettings() {
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeRole[]>([]);
  const [settings, setSettings] = useState<OkrRoleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('employee_roles')
          .select('*')
          .order('name');

        if (rolesError) throw rolesError;
        
        // Add description property to match EmployeeRole interface
        const roles = rolesData.map(role => ({
          ...role,
          description: role.name
        }));
        
        setEmployeeRoles(roles);

        // Fetch OKR role settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('okr_role_settings')
          .select('*')
          .limit(1)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }

        if (settingsData) {
          setSettings(settingsData as unknown as OkrRoleSettings);
        } else {
          // Create default settings if none exist
          const { data: newSettings, error: createError } = await supabase
            .from('okr_role_settings')
            .insert({
              can_create_objectives: [],
              can_create_org_objectives: [],
              can_create_dept_objectives: [],
              can_create_team_objectives: [],
              can_create_key_results: [],
              can_create_alignments: [],
              can_align_with_org_objectives: [],
              can_align_with_dept_objectives: [],
              can_align_with_team_objectives: []
            })
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings as unknown as OkrRoleSettings);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('okr_role_settings')
        .update({
          can_create_objectives: settings.can_create_objectives,
          can_create_org_objectives: settings.can_create_org_objectives,
          can_create_dept_objectives: settings.can_create_dept_objectives,
          can_create_team_objectives: settings.can_create_team_objectives,
          can_create_key_results: settings.can_create_key_results,
          can_create_alignments: settings.can_create_alignments,
          can_align_with_org_objectives: settings.can_align_with_org_objectives,
          can_align_with_dept_objectives: settings.can_align_with_dept_objectives,
          can_align_with_team_objectives: settings.can_align_with_team_objectives
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (roleId: string, settingKey: keyof OkrRoleSettings) => {
    if (!settings) return;
    
    const currentSetting = settings[settingKey] || [];
    const updatedSetting = currentSetting.includes(roleId)
      ? currentSetting.filter(id => id !== roleId)
      : [...currentSetting, roleId];
    
    setSettings({
      ...settings,
      [settingKey]: updatedSetting
    });
  };

  const isRoleSelected = (roleId: string, settingKey: keyof OkrRoleSettings): boolean => {
    if (!settings) return false;
    return (settings[settingKey] || []).includes(roleId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">OKR Role Settings</h1>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
        >
          {saving ? <LoadingSpinner size={16} className="mr-2" /> : null}
          Save Settings
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Objective Creation Permissions</CardTitle>
          <CardDescription>
            Configure which employee roles can create objectives with different visibility levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="font-semibold">Employee Role</div>
              <div className="font-semibold text-center">Create Objectives</div>
              <div className="font-semibold text-center">Organization-level</div>
              <div className="font-semibold text-center">Department-level</div>
              <div className="font-semibold text-center">Team-level</div>
            </div>
            
            {employeeRoles.map(role => (
              <div key={role.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>{role.name}</div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_objectives')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_org_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_org_objectives')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_dept_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_dept_objectives')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_team_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_team_objectives')}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Results Permissions</CardTitle>
          <CardDescription>
            Configure which employee roles can create key results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="font-semibold">Employee Role</div>
              <div className="font-semibold text-center">Create Key Results</div>
            </div>
            
            {employeeRoles.map(role => (
              <div key={role.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>{role.name}</div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_key_results')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_key_results')}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alignment Permissions</CardTitle>
          <CardDescription>
            Configure which employee roles can create alignments between objectives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="font-semibold">Employee Role</div>
              <div className="font-semibold text-center">Create Alignments</div>
              <div className="font-semibold text-center">Align with Org-level</div>
              <div className="font-semibold text-center">Align with Dept-level</div>
              <div className="font-semibold text-center">Align with Team-level</div>
            </div>
            
            {employeeRoles.map(role => (
              <div key={role.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>{role.name}</div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_create_alignments')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_create_alignments')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_align_with_org_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_align_with_org_objectives')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_align_with_dept_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_align_with_dept_objectives')}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    checked={isRoleSelected(role.id, 'can_align_with_team_objectives')}
                    onCheckedChange={() => handleRoleToggle(role.id, 'can_align_with_team_objectives')}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
