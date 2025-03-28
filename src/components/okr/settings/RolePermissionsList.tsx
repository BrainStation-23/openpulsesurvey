import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OkrRoleSettings } from "@/types/okr-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Settings, Users, Target, ArrowRight, Search, Filter } from "lucide-react";
import { RolePermissionDialog } from "./RolePermissionDialog";
import { useEmployeeRoles } from "@/hooks/useEmployeeRoles";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  category: 'creation' | 'alignments' | 'management';
  color: string;
};

export function RolePermissionsList({ settings, loading }: RolePermissionsListProps) {
  const [editingPermission, setEditingPermission] = useState<{
    section: PermissionSection;
    open: boolean;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { employeeRoles, loading: rolesLoading } = useEmployeeRoles();
  
  const permissionSections: PermissionSection[] = [
    {
      id: "create_objectives",
      title: "Create Objectives",
      description: "Roles that can create objectives at any level",
      settingKey: "can_create_objectives",
      icon: <Target className="h-4 w-4" />,
      category: 'creation',
      color: "bg-blue-100 border-blue-300"
    },
    {
      id: "create_org_objectives",
      title: "Create Organization Objectives",
      description: "Roles that can create organization-level objectives",
      settingKey: "can_create_org_objectives",
      icon: <Target className="h-4 w-4" />,
      category: 'creation',
      color: "bg-blue-100 border-blue-300"
    },
    {
      id: "create_dept_objectives",
      title: "Create Department Objectives",
      description: "Roles that can create department-level objectives",
      settingKey: "can_create_dept_objectives",
      icon: <Target className="h-4 w-4" />,
      category: 'creation',
      color: "bg-blue-100 border-blue-300"
    },
    {
      id: "create_team_objectives",
      title: "Create Team Objectives",
      description: "Roles that can create team-level objectives",
      settingKey: "can_create_team_objectives",
      icon: <Target className="h-4 w-4" />,
      category: 'creation',
      color: "bg-blue-100 border-blue-300"
    },
    {
      id: "create_key_results",
      title: "Create Key Results",
      description: "Roles that can create key results for any objective",
      settingKey: "can_create_key_results",
      icon: <Target className="h-4 w-4" />,
      category: 'creation',
      color: "bg-blue-100 border-blue-300"
    },
    
    {
      id: "create_alignments",
      title: "Create Alignments",
      description: "Roles that can create alignments between objectives",
      settingKey: "can_create_alignments",
      icon: <ArrowRight className="h-4 w-4" />,
      category: 'alignments',
      color: "bg-purple-100 border-purple-300"
    },
    {
      id: "align_with_org_objectives",
      title: "Align with Organization Objectives",
      description: "Roles that can align objectives with organization-level objectives",
      settingKey: "can_align_with_org_objectives",
      icon: <ArrowRight className="h-4 w-4" />,
      category: 'alignments',
      color: "bg-purple-100 border-purple-300"
    },
    {
      id: "align_with_dept_objectives",
      title: "Align with Department Objectives",
      description: "Roles that can align objectives with department-level objectives",
      settingKey: "can_align_with_dept_objectives",
      icon: <ArrowRight className="h-4 w-4" />,
      category: 'alignments',
      color: "bg-purple-100 border-purple-300"
    },
    {
      id: "align_with_team_objectives",
      title: "Align with Team Objectives",
      description: "Roles that can align objectives with team-level objectives",
      settingKey: "can_align_with_team_objectives",
      icon: <ArrowRight className="h-4 w-4" />,
      category: 'alignments',
      color: "bg-purple-100 border-purple-300"
    }
  ];

  const groupedPermissions = {
    creation: permissionSections.filter(section => section.category === 'creation'),
    alignments: permissionSections.filter(section => section.category === 'alignments'),
    management: permissionSections.filter(section => section.category === 'management'),
  };

  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return permissionSections;
    }
    
    return permissionSections.filter(section => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, permissionSections]);

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
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">No roles assigned</Badge>;
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

  const renderPermissionCard = (section: PermissionSection) => (
    <Card key={section.id} className={`border-l-4 ${section.color}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="w-full">
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
            className="ml-2 whitespace-nowrap"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6 gap-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {searchTerm ? (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Search Results</h2>
          {filteredPermissions.length === 0 ? (
            <p className="text-muted-foreground">No permissions match your search.</p>
          ) : (
            filteredPermissions.map(renderPermissionCard)
          )}
        </div>
      ) : (
        <Tabs defaultValue="creation">
          <TabsList className="mb-4">
            <TabsTrigger value="creation">Creation Permissions</TabsTrigger>
            <TabsTrigger value="alignments">Alignment Permissions</TabsTrigger>
            {groupedPermissions.management.length > 0 && (
              <TabsTrigger value="management">Management Permissions</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="creation" className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-300 rounded-full mr-2"></div>
              <h2 className="text-lg font-medium">Creation Permissions</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Control which roles can create different types of objectives and key results.
            </p>
            {groupedPermissions.creation.map(renderPermissionCard)}
          </TabsContent>
          
          <TabsContent value="alignments" className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-300 rounded-full mr-2"></div>
              <h2 className="text-lg font-medium">Alignment Permissions</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Control which roles can create alignments between objectives at different levels.
            </p>
            {groupedPermissions.alignments.map(renderPermissionCard)}
          </TabsContent>
          
          {groupedPermissions.management.length > 0 && (
            <TabsContent value="management" className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded-full mr-2"></div>
                <h2 className="text-lg font-medium">Management Permissions</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Control which roles can manage and administer the OKR system.
              </p>
              {groupedPermissions.management.map(renderPermissionCard)}
            </TabsContent>
          )}
        </Tabs>
      )}
      
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
