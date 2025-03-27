
import React, { useEffect } from 'react';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';
import { ObjectiveForm } from './ObjectiveForm';
import { CreateObjectiveInput, ObjectiveVisibility, UpdateObjectiveInput } from '@/types/okr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ObjectiveFormWithPermissionsProps {
  onSubmit: (data: CreateObjectiveInput | UpdateObjectiveInput) => void;
  isSubmitting: boolean;
  objective?: any;
  initialCycleId?: string;
  onCancel?: () => void;
}

export const ObjectiveFormWithPermissions: React.FC<ObjectiveFormWithPermissionsProps> = ({
  onSubmit,
  isSubmitting,
  objective,
  initialCycleId,
  onCancel
}) => {
  const { 
    canCreateObjectives, 
    canCreateObjectiveWithVisibility, 
    isLoading 
  } = useOkrPermissions();

  // Define a custom submit handler to check permissions before submitting
  const handleSubmit = (data: CreateObjectiveInput | UpdateObjectiveInput) => {
    // If editing an existing objective, we don't enforce permission checks
    if (objective) {
      onSubmit(data);
      return;
    }

    // For new objectives, check visibility permissions
    const visibility = data.visibility as ObjectiveVisibility;
    if (!canCreateObjectiveWithVisibility(visibility)) {
      alert('You do not have permission to create objectives with this visibility level.');
      return;
    }

    onSubmit(data);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <LoadingSpinner size={36} />
          <p className="mt-4 text-muted-foreground">Loading permissions...</p>
        </CardContent>
      </Card>
    );
  }

  // If not editing and user doesn't have basic create permission, show an alert
  if (!objective && !canCreateObjectives) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to create objectives. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {!objective && (
        <Alert className="mb-6">
          <AlertTitle>Visibility Permissions</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm">
              <li className={canCreateObjectiveWithVisibility('organization') ? 'text-green-600' : 'text-red-600'}>
                {canCreateObjectiveWithVisibility('organization') 
                  ? 'You can create Organization-level objectives' 
                  : 'You cannot create Organization-level objectives'}
              </li>
              <li className={canCreateObjectiveWithVisibility('department') ? 'text-green-600' : 'text-red-600'}>
                {canCreateObjectiveWithVisibility('department') 
                  ? 'You can create Department-level objectives' 
                  : 'You cannot create Department-level objectives'}
              </li>
              <li className={canCreateObjectiveWithVisibility('team') ? 'text-green-600' : 'text-red-600'}>
                {canCreateObjectiveWithVisibility('team') 
                  ? 'You can create Team-level objectives' 
                  : 'You cannot create Team-level objectives'}
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <ObjectiveForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        objective={objective}
        initialCycleId={initialCycleId}
        onCancel={onCancel}
      />
    </>
  );
};
