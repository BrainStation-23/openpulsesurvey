
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Type for employee role
interface EmployeeRole {
  id: string;
  name: string;
  description: string;
}

// Type for OKR role settings
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch employee roles and settings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employee roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('employee_roles')
          .select('*')
          .order('name');

        if (rolesError) throw rolesError;
        setEmployeeRoles(rolesData || []);

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
          setSettings(settingsData as OkrRoleSettings);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load OKR settings.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('okr_role_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'OKR settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save OKR settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to toggle role ID in a settings array
  const toggleRoleInSetting = (roleId: string, settingName: keyof OkrRoleSettings) => {
    if (!settings) return;
    
    const currentSetting = settings[settingName] as string[];
    const newSetting = currentSetting.includes(roleId)
      ? currentSetting.filter(id => id !== roleId)
      : [...currentSetting, roleId];
    
    setSettings({
      ...settings,
      [settingName]: newSetting,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Settings</h1>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Configure which employee roles can perform different OKR actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Objective Creation Permissions</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Role</th>
                      <th className="text-center py-2 px-4">Create Objectives</th>
                      <th className="text-center py-2 px-4">Organization Level</th>
                      <th className="text-center py-2 px-4">Department Level</th>
                      <th className="text-center py-2 px-4">Team Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeRoles.map((role) => (
                      <tr key={role.id} className="border-b">
                        <td className="py-2 px-4">{role.name}</td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_objectives as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_objectives')}
                          />
                        </td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_org_objectives as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_org_objectives')}
                          />
                        </td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_dept_objectives as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_dept_objectives')}
                          />
                        </td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_team_objectives as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_team_objectives')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Key Results & Alignments</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Role</th>
                      <th className="text-center py-2 px-4">Create Key Results</th>
                      <th className="text-center py-2 px-4">Create Alignments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeRoles.map((role) => (
                      <tr key={role.id} className="border-b">
                        <td className="py-2 px-4">{role.name}</td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_key_results as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_key_results')}
                          />
                        </td>
                        <td className="text-center py-2 px-4">
                          <Checkbox 
                            checked={(settings.can_create_alignments as string[]).includes(role.id)}
                            onCheckedChange={() => toggleRoleInSetting(role.id, 'can_create_alignments')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No settings data found. Save to create initial settings.</p>
              <Button onClick={handleSaveSettings} className="mt-4">
                Create Default Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
