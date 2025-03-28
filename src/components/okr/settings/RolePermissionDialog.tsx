
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Info } from 'lucide-react';
import { useOkrRoles } from '@/hooks/okr/useOkrRoles';
import { useToast } from '@/hooks/use-toast';
import { OkrRoleSettings } from '@/types/okr-settings';
import { MultiRoleSelector } from './MultiRoleSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(currentRoleIds || []);
  const [submitting, setSubmitting] = useState(false);
  const { updateSettings } = useOkrRoles();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const updatedSettings = {
        ...settings,
        [permissionKey]: selectedRoleIds
      };
      
      const success = await updateSettings(updatedSettings);
      
      if (success) {
        toast({
          title: "Settings updated",
          description: `${title} permissions have been updated successfully.`,
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating settings",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = JSON.stringify(selectedRoleIds.sort()) !== JSON.stringify(currentRoleIds.sort());

  return (
    <Dialog open={open} onOpenChange={onClose}>
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

        <div className="py-4">
          <div className="space-y-4">
            <MultiRoleSelector
              selectedRoleIds={selectedRoleIds}
              onChange={setSelectedRoleIds}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={submitting || !hasChanges}
            className={hasChanges ? "" : "opacity-70"}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
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
