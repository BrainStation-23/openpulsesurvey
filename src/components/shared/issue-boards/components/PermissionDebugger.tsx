import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "../contexts/PermissionContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

export function PermissionDebugger() {
  const { permissions, isLoading, error, refetch } = usePermissionContext();
  const [isVisible, setIsVisible] = React.useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto">
      <Card className="p-4 space-y-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Permission Debug</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            Error: {error.message}
          </div>
        )}

        {permissions && (
          <>
            <div className="space-y-2">
              <div className="text-xs font-medium">Permissions</div>
              <div className="flex gap-1 flex-wrap">
                <Badge variant={permissions.can_view ? "default" : "secondary"}>
                  View: {permissions.can_view ? "✓" : "✗"}
                </Badge>
                <Badge variant={permissions.can_create ? "default" : "secondary"}>
                  Create: {permissions.can_create ? "✓" : "✗"}
                </Badge>
                <Badge variant={permissions.can_vote ? "default" : "secondary"}>
                  Vote: {permissions.can_vote ? "✓" : "✗"}
                </Badge>
              </div>
            </div>

            {permissions.applied_rules.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium">Applied Rules</div>
                <div className="space-y-1">
                  {permissions.applied_rules.map((rule, index) => (
                    <div key={index} className="text-xs p-2 rounded bg-muted">
                      <div className="font-medium">{rule.rule_name}</div>
                      <div className="text-muted-foreground">
                        Type: {rule.rule_type} | Priority: {rule.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {permissions.user_context && (
              <div className="space-y-2">
                <div className="text-xs font-medium">User Context</div>
                <div className="text-xs text-muted-foreground">
                  <div>Level: {permissions.user_context.level_id || 'None'}</div>
                  <div>Location: {permissions.user_context.location_id || 'None'}</div>
                  <div>SBUs: {permissions.user_context.sbu_ids?.length || 0}</div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}