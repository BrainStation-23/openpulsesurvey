import React from "react";
import { toast } from "@/components/ui/use-toast";
import type { IssueBoardPermission } from "../types";
import { usePermissionValidation } from "./usePermissionValidation";

export interface UsePermissionFormReturn {
  permissions: Partial<IssueBoardPermission>[];
  expandedRules: Record<number, boolean>;
  activeStep: 'overview' | 'rules';
  setActiveStep: (step: 'overview' | 'rules') => void;
  addPermission: () => void;
  duplicatePermission: (index: number) => void;
  removePermission: (index: number) => void;
  updatePermission: (index: number, field: keyof IssueBoardPermission, value: any) => void;
  toggleRule: (index: number) => void;
  handleSubmit: (e: React.FormEvent, onSubmit: (permissions: Partial<IssueBoardPermission>[]) => void) => void;
  getSelectionSummary: (permission: Partial<IssueBoardPermission>) => string;
  getPermissionsSummary: (permission: Partial<IssueBoardPermission>) => string;
  getTotalUsersAffected: () => number;
}

export function usePermissionForm(
  initialPermissions: IssueBoardPermission[]
): UsePermissionFormReturn {
  const [permissions, setPermissions] = React.useState<Partial<IssueBoardPermission>[]>(
    initialPermissions.length > 0 ? initialPermissions : [{}]
  );
  const [expandedRules, setExpandedRules] = React.useState<Record<number, boolean>>(
    Object.fromEntries(permissions.map((_, i) => [i, false]))
  );
  const [activeStep, setActiveStep] = React.useState<'overview' | 'rules'>('overview');

  const { validatePermissions, enforcePermissionDependencies, validateRuleConflicts } = usePermissionValidation();

  const addPermission = React.useCallback(() => {
    const newIndex = permissions.length;
    const defaultPermission = {
      rule_name: `Rule ${newIndex + 1}`,
      rule_type: 'include' as const,
      priority: 100,
      is_active: true,
    };
    setPermissions(prev => [...prev, defaultPermission]);
    setExpandedRules(prev => ({ ...prev, [newIndex]: true }));
  }, [permissions.length]);

  const duplicatePermission = React.useCallback((index: number) => {
    const newPermission = { ...permissions[index] };
    setPermissions(prev => [...prev, newPermission]);
    setExpandedRules(prev => ({ ...prev, [permissions.length]: true }));
  }, [permissions]);

  const removePermission = React.useCallback((index: number) => {
    setPermissions(prev => prev.filter((_, i) => i !== index));
    setExpandedRules(prev => {
      const { [index]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const updatePermission = React.useCallback((index: number, field: keyof IssueBoardPermission, value: any) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      newPermissions[index] = enforcePermissionDependencies({
        ...newPermissions[index],
        [field]: value
      });
      return newPermissions;
    });
  }, [enforcePermissionDependencies]);

  const toggleRule = React.useCallback((index: number) => {
    setExpandedRules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const handleSubmit = React.useCallback((e: React.FormEvent, onSubmit: (permissions: Partial<IssueBoardPermission>[]) => void) => {
    e.preventDefault();
    const errors = validatePermissions(permissions);
    const conflicts = validateRuleConflicts(permissions);
    
    const allErrors = [...errors, ...conflicts];
    if (allErrors.length > 0) {
      allErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }
    
    onSubmit(permissions);
  }, [permissions, validatePermissions, validateRuleConflicts]);

  const getSelectionSummary = React.useCallback((permission: Partial<IssueBoardPermission>) => {
    const counts = {
      sbus: permission.sbu_ids?.length || 0,
      levels: permission.level_ids?.length || 0,
      locations: permission.location_ids?.length || 0,
      employmentTypes: permission.employment_type_ids?.length || 0,
      employeeTypes: permission.employee_type_ids?.length || 0,
      employeeRoles: permission.employee_role_ids?.length || 0,
    };

    const totalSelected = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalSelected === 0) return "No criteria selected";
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => `${count} ${key.replace(/([A-Z])/g, ' $1').trim()}`)
      .join(' • ');
  }, []);

  const getPermissionsSummary = React.useCallback((permission: Partial<IssueBoardPermission>) => {
    const activePermissions = [];
    if (permission.can_view) activePermissions.push("View");
    if (permission.can_create) activePermissions.push("Create");
    if (permission.can_vote) activePermissions.push("Vote");
    
    return activePermissions.length > 0 ? activePermissions.join(" • ") : "No permissions";
  }, []);

  const getTotalUsersAffected = React.useCallback(() => {
    return permissions.reduce((sum, permission) => {
      const criteria = [
        permission.sbu_ids?.length || 0,
        permission.level_ids?.length || 0,
        permission.location_ids?.length || 0,
      ].filter(count => count > 0);
      return sum + (criteria.length > 0 ? Math.min(criteria.reduce((a, b) => a * b, 1), 1000) : 0);
    }, 0);
  }, [permissions]);

  return {
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
  };
}