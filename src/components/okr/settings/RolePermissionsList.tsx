
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OkrRoleSettings, OkrPermissionType } from "@/types/okr-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Settings, Users } from "lucide-react";
import { RolePermissionDialog } from "./RolePermissionDialog";
import { useEmployeeRoles } from "@/hooks/useEmployeeRoles";

interface RolePermissionsListProps {
  settings: OkrRoleSettings | null;
  loading: boolean;
}

type PermissionSection = {
  id: string;
  title: string;
  description: string;
  settingKey: keyof OkrRoleSettings;
  icon: React.ReactNode;
};

export function RolePermissionsList({ settings, loading }: RolePermissionsListProps) {
  const [editingPermission, setEditingPermission] = useState<{
    section: PermissionSection;
    open: boolean;
  } | null>(null);
  
  const { employeeRoles, loading: rolesLoading } = useEmployeeRoles();
  
  const permissionSections: PermissionSection[] = [
    {
      id: "create_objectives",
      title: "Create Objectives",
      description: "Roles that can create objectives at any level",
      settingKey: "can_create_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "create_org_objectives",
      title: "Create Organization Objectives",
      description: "Roles that can create organization-level objectives",
      settingKey: "can_create_org_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "create_dept_objectives",
      title: "Create Department Objectives",
      description: "Roles that can create department-level objectives",
      settingKey: "can_create_dept_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "create_team_objectives",
      title: "Create Team Objectives",
      description: "Roles that can create team-level objectives",
      settingKey: "can_create_team_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "create_key_results",
      title: "Create Key Results",
      description: "Roles that can create key results for any objective",
      settingKey: "can_create_key_results",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "create_alignments",
      title: "Create Alignments",
      description: "Roles that can create alignments between objectives",
      settingKey: "can_create_alignments",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "align_with_org_objectives",
      title: "Align with Organization Objectives",
      description: "Roles that can align objectives with organization-level objectives",
      settingKey: "can_align_with_org_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "align_with_dept_objectives",
      title: "Align with Department Objectives",
      description: "Roles that can align objectives with department-level objectives",
      settingKey: "can_align_with_dept_objectives",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "align_with_team_objectives",
      title: "Align with Team Objectives",
      description: "Roles that can align objectives with team-level objectives",
      settingKey: "can_align_with_team_objectives",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No OKR role settings found. Please configure the settings.
      </div>
    );
  }

  const getRoleNames = (roleIds: string[]) => {
    if (!employeeRoles || rolesLoading) {
      return "Loading roles...";
    }
    
    if (roleIds.length === 0) {
      return "No roles assigned";
    }
    
    const names = roleIds.map(id => {
      const role = employeeRoles.find(r => r.id === id);
      return role ? role.name : 'Unknown role';
    });
    
    return names.map(name => <Badge key={name} className="mr-1 mb-1">{name}</Badge>);
  };

  const openEditPermission = (section: PermissionSection) => {
    setEditingPermission({
      section,
      open: true
    });
  };

  return (
    <div className="space-y-4">
      {permissionSections.map((section) => (
        <Card key={section.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  {section.icon} {section.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <div className="flex flex-wrap mt-2">
                  {getRoleNames(settings[section.settingKey] as string[])}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openEditPermission(section)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {editingPermission && (
        <RolePermissionDialog 
          open={editingPermission.open}
          title={`Edit ${editingPermission.section.title} Permission`}
          description={editingPermission.section.description}
          permissionKey={editingPermission.section.settingKey}
          currentRoleIds={settings[editingPermission.section.settingKey] as string[]}
          onClose={() => setEditingPermission(null)}
          settings={settings}
        />
      )}
    </div>
  );
}
