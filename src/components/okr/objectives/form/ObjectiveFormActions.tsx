
import React from 'react';
import { Button } from "@/components/ui/button";

interface ObjectiveFormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
  isEditing: boolean;
}

export const ObjectiveFormActions: React.FC<ObjectiveFormActionsProps> = ({
  isSubmitting,
  onCancel,
  isEditing
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Objective' : 'Create Objective')}
      </Button>
    </div>
  );
};
