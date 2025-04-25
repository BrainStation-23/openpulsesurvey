
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Info, AlertTriangle } from 'lucide-react';
import { useOkrRoles } from '@/hooks/okr/useOkrRoles';
import { useToast } from '@/hooks/use-toast';
import { OkrRoleSettings } from '@/types/okr-settings';
import { MultiRoleSelector } from './MultiRoleSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define clear state types
type DialogState = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

interface RolePermissionDialogProps {
  open: boolean;
  title: string;
  description: string;
  permissionKey: keyof OkrRoleSettings;
  currentRoleIds: string[];
  onClose: () => void;
  settings: OkrRoleSettings;
}

export function RolePermissionDialog({
  open,
  title,
  description,
  permissionKey,
  currentRoleIds,
  onClose,
  settings,
}: RolePermissionDialogProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { updateSettings } = useOkrRoles();
  const { toast } = useToast();

  // Initialize selected roles when the dialog opens
  useEffect(() => {
    if (open) {
      setSelectedRoleIds(currentRoleIds || []);
      setDialogState('idle');
      setErrorMessage(null);
    }
  }, [open, currentRoleIds]);

  // Memoize whether there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentSorted = [...(currentRoleIds || [])].sort().join(',');
    const selectedSorted = [...selectedRoleIds].sort().join(',');
    return currentSorted !== selectedSorted;
  }, [currentRoleIds, selectedRoleIds]);

  // Debounced role selector change handler
  const handleRoleChange = useCallback((newRoleIds: string[]) => {
    setSelectedRoleIds(newRoleIds);
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    try {
      setDialogState('submitting');
      setErrorMessage(null);
      
      const updatedSettings = {
        ...settings,
        [permissionKey]: selectedRoleIds
      };
      
      const success = await updateSettings(updatedSettings);
      
      if (success) {
        setDialogState('success');
        toast({
          title: "Settings updated",
          description: `${title} permissions have been updated successfully.`,
        });
        // Allow the success state to be visible briefly before closing
        setTimeout(() => {
          onClose();
          setDialogState('idle');
        }, 1000);
      } else {
        throw new Error("Unknown error occurred during update");
      }
    } catch (error: any) {
      setDialogState('error');
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error updating settings",
        description: error.message || "Failed to update settings. Please try again.",
      });
    }
  }, [hasChanges, permissionKey, selectedRoleIds, settings, title, toast, updateSettings, onClose]);

  // Safe close handler
  const handleClose = useCallback(() => {
    if (dialogState !== 'submitting') {
      onClose();
    }
  }, [dialogState, onClose]);

  // Render error message if present
  const renderError = () => {
    if (dialogState !== 'error' || !errorMessage) return null;
    
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700">
            Select which employee roles should have this permission. Users with multiple roles will 
            have the combined permissions of all their assigned roles.
          </AlertDescription>
        </Alert>

        {renderError()}

        <div className="py-4">
          <div className="space-y-4">
            <MultiRoleSelector
              selectedRoleIds={selectedRoleIds}
              onChange={handleRoleChange}
              disabled={dialogState === 'submitting'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={dialogState === 'submitting'}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={dialogState === 'submitting' || !hasChanges}
            className={hasChanges ? "" : "opacity-70"}
          >
            {dialogState === 'submitting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : dialogState === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" /> Saved
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
