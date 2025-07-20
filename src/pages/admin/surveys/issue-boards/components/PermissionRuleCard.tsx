import React from "react";
import { ChevronDown, ChevronRight, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PermissionTargetSection } from "./PermissionTargetSection";
import { PermissionActionsSection } from "./PermissionActionsSection";
import { RuleSettingsSection } from "./RuleSettingsSection";
import { PermissionRuleExplanation } from "./PermissionRuleExplanation";
import type { IssueBoardPermission } from "../types";
import type { UsePermissionDataReturn } from "../hooks/usePermissionData";

interface PermissionRuleCardProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
  isExpanded: boolean;
  permissions: Partial<IssueBoardPermission>[];
  permissionData: UsePermissionDataReturn;
  getSelectionSummary: (permission: Partial<IssueBoardPermission>) => string;
  getPermissionsSummary: (permission: Partial<IssueBoardPermission>) => string;
  updatePermission: (index: number, field: keyof IssueBoardPermission, value: any) => void;
  duplicatePermission: (index: number) => void;
  removePermission: (index: number) => void;
  toggleRule: (index: number) => void;
}

export function PermissionRuleCard({
  permission,
  index,
  isExpanded,
  permissions,
  permissionData,
  getSelectionSummary,
  getPermissionsSummary,
  updatePermission,
  duplicatePermission,
  removePermission,
  toggleRule
}: PermissionRuleCardProps) {
  return (
    <Card className="overflow-hidden">
      <Collapsible
        open={isExpanded}
        onOpenChange={() => toggleRule(index)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
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
            {!isExpanded && (
              <CardDescription className="mt-2">
                {getSelectionSummary(permission)} • {getPermissionsSummary(permission)}
              </CardDescription>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid lg:grid-cols-2 gap-8">
              <PermissionTargetSection
                permission={permission}
                index={index}
                updatePermission={updatePermission}
                permissionData={permissionData}
              />

              <div className="space-y-6">
                <PermissionActionsSection
                  permission={permission}
                  index={index}
                  updatePermission={updatePermission}
                />

                <RuleSettingsSection
                  permission={permission}
                  index={index}
                  updatePermission={updatePermission}
                />

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
  );
}