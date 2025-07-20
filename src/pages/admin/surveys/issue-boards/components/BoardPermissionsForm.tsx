import React from "react";
import { Plus, Users, Shield, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { IssueBoard, IssueBoardPermission } from "../types";
import { usePermissionData } from "../hooks/usePermissionData";
import { usePermissionForm } from "../hooks/usePermissionForm";
import { PermissionOverviewCard } from "./PermissionOverviewCard";
import { PermissionRuleCard } from "./PermissionRuleCard";

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
  const permissionData = usePermissionData();
  const {
    permissions,
    expandedRules,
    activeStep,
    setActiveStep,
    addPermission,
    duplicatePermission,
    removePermission,
    updatePermission,
    toggleRule,
    handleSubmit,
    getSelectionSummary,
    getPermissionsSummary,
    getTotalUsersAffected
  } = usePermissionForm(initialPermissions);

  if (permissionData.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading permission data...</p>
        </div>
      </div>
    );
  }

  if (permissionData.error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load permission data</p>
          <p className="text-sm text-muted-foreground mt-2">{permissionData.error.message}</p>
        </div>
      </div>
    );
  }

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
                <PermissionOverviewCard
                  key={index}
                  permission={permission}
                  index={index}
                  getSelectionSummary={getSelectionSummary}
                  onEdit={() => {
                    setActiveStep('rules');
                    toggleRule(index);
                  }}
                />
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
        <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {permissions.map((permission, index) => (
              <PermissionRuleCard
                key={index}
                permission={permission}
                index={index}
                isExpanded={expandedRules[index]}
                permissions={permissions}
                permissionData={permissionData}
                getSelectionSummary={getSelectionSummary}
                getPermissionsSummary={getPermissionsSummary}
                updatePermission={updatePermission}
                duplicatePermission={duplicatePermission}
                removePermission={removePermission}
                toggleRule={toggleRule}
              />
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