
import { useCallback } from "react";
import type { IssueBoardPermission } from "../types";

export function usePermissionValidation() {
  const validatePermissions = useCallback((permissions: Partial<IssueBoardPermission>[]) => {
    const errors: string[] = [];

    permissions.forEach((permission, index) => {
      // Basic permission dependency validation
      if (permission.can_create && !permission.can_view) {
        errors.push(`Rule ${index + 1}: Create permission requires View permission`);
      }
      if (permission.can_vote && !permission.can_view) {
        errors.push(`Rule ${index + 1}: Vote permission requires View permission`);
      }

      // Rule priority validation
      if (permission.priority !== undefined && (permission.priority < 0 || permission.priority > 1000)) {
        errors.push(`Rule ${index + 1}: Priority must be between 0 and 1000`);
      }

      // Rule name validation
      if (permission.rule_name && permission.rule_name.length > 100) {
        errors.push(`Rule ${index + 1}: Rule name must be 100 characters or less`);
      }

      // Rule type validation
      if (permission.rule_type && !['include', 'exclude'].includes(permission.rule_type)) {
        errors.push(`Rule ${index + 1}: Rule type must be either 'include' or 'exclude'`);
      }
    });

    return errors;
  }, []);

  const enforcePermissionDependencies = useCallback((permission: Partial<IssueBoardPermission>) => {
    const updatedPermission = { ...permission };
    
    // Auto-enable view permission if create or vote is enabled
    if (permission.can_create || permission.can_vote) {
      updatedPermission.can_view = true;
    }

    // Set default values for new fields
    if (!updatedPermission.rule_type) {
      updatedPermission.rule_type = 'include';
    }
    if (updatedPermission.priority === undefined) {
      updatedPermission.priority = 100;
    }
    if (updatedPermission.is_active === undefined) {
      updatedPermission.is_active = true;
    }
    
    return updatedPermission;
  }, []);

  const validateRuleConflicts = useCallback((permissions: Partial<IssueBoardPermission>[]) => {
    const conflicts: string[] = [];
    const sortedPermissions = [...permissions].sort((a, b) => (a.priority || 100) - (b.priority || 100));

    for (let i = 0; i < sortedPermissions.length - 1; i++) {
      const current = sortedPermissions[i];
      const next = sortedPermissions[i + 1];

      if (current.priority === next.priority && current.rule_type !== next.rule_type) {
        conflicts.push(`Rules with priority ${current.priority} have conflicting types (include/exclude)`);
      }
    }

    return conflicts;
  }, []);

  return {
    validatePermissions,
    enforcePermissionDependencies,
    validateRuleConflicts
  };
}
