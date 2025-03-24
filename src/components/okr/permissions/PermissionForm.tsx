
import React, { useState } from 'react';
import { UserSelector } from './UserSelector';
import { SBUSelector } from './SBUSelector';
import { EmployeeRoleSelector } from './EmployeeRoleSelector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PermissionFormValues } from '@/hooks/okr/useObjectivePermissions';

interface PermissionFormProps {
  initialValues?: PermissionFormValues;
  onSubmit: (values: PermissionFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const defaultValues: PermissionFormValues = {
  userIds: [],
  sbuIds: [],
  employeeRoleIds: [],
  canView: true,
  canEdit: false,
  canComment: false
};

export const PermissionForm = ({
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false
}: PermissionFormProps) => {
  const [values, setValues] = useState<PermissionFormValues>(initialValues);

  const handleChange = (field: keyof PermissionFormValues, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const atLeastOneSelected = values.userIds.length > 0 || values.sbuIds.length > 0 || values.employeeRoleIds.length > 0;
  const isValid = atLeastOneSelected && (values.canView || values.canEdit || values.canComment);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Who should have access?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select users, business units, or employee roles to grant access to.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Users</Label>
              <UserSelector
                selectedUsers={values.userIds}
                onChange={(userIds) => handleChange('userIds', userIds)}
                placeholder="Search users..."
              />
            </div>

            <div>
              <Label className="mb-2 block">Business Units</Label>
              <SBUSelector
                selectedSBUs={values.sbuIds}
                onChange={(sbuIds) => handleChange('sbuIds', sbuIds)}
                placeholder="Search business units..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Employee Roles</Label>
              <EmployeeRoleSelector
                selectedRoles={values.employeeRoleIds}
                onChange={(roleIds) => handleChange('employeeRoleIds', roleIds)}
                placeholder="Search employee roles..."
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">What level of access?</h3>
              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canView"
                    checked={values.canView}
                    onCheckedChange={(checked) => handleChange('canView', checked)}
                  />
                  <Label htmlFor="canView" className="cursor-pointer">
                    Can view
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={values.canEdit}
                    onCheckedChange={(checked) => handleChange('canEdit', checked)}
                  />
                  <Label htmlFor="canEdit" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canComment"
                    checked={values.canComment}
                    onCheckedChange={(checked) => handleChange('canComment', checked)}
                  />
                  <Label htmlFor="canComment" className="cursor-pointer">
                    Can comment
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </form>
  );
};
