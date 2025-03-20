
import { useCallback } from "react";
import type { IssueBoardPermission } from "../types";

export function usePermissionValidation() {
  const validatePermissions = useCallback((permissions: Partial<IssueBoardPermission>[]) => {
    const errors: string[] = [];

    permissions.forEach((permission, index) => {
      if (permission.can_create && !permission.can_view) {
        errors.push(`Rule ${index + 1}: Create permission requires View permission`);
      }
      if (permission.can_vote && !permission.can_view) {
        errors.push(`Rule ${index + 1}: Vote permission requires View permission`);
      }
    });

    return errors;
  }, []);

  const enforcePermissionDependencies = useCallback((permission: Partial<IssueBoardPermission>) => {
    const updatedPermission = { ...permission };
    
    if (permission.can_create || permission.can_vote) {
      updatedPermission.can_view = true;
    }
    
    return updatedPermission;
  }, []);

  return {
    validatePermissions,
    enforcePermissionDependencies
  };
}
