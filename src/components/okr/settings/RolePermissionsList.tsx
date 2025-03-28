
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OkrRoleSettings } from "@/types/okr-settings";
import { Skeleton } from "@/components/ui/skeleton";

interface RolePermissionsListProps {
  settings: OkrRoleSettings | null;
  loading: boolean;
}

export function RolePermissionsList({ settings, loading }: RolePermissionsListProps) {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Create Objectives</h3>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for a list of roles that can create objectives.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Create Key Results</h3>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for a list of roles that can create key results.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Create Alignments</h3>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for a list of roles that can create alignments between objectives.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
