import React from "react";
import { Eye, Edit, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IssueBoardPermission } from "../types";

interface PermissionOverviewCardProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
  getSelectionSummary: (permission: Partial<IssueBoardPermission>) => string;
  onEdit: () => void;
}

export function PermissionOverviewCard({
  permission,
  index,
  getSelectionSummary,
  onEdit
}: PermissionOverviewCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
            onClick={onEdit}
          >
            Edit Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}