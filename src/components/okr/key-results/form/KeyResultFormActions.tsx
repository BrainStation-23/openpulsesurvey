
import React from 'react';
import { Button } from '@/components/ui/button';

interface KeyResultFormActionsProps {
  onClose: (success?: boolean) => void;
  mode: 'create' | 'edit';
  isPending: boolean;
}

export const KeyResultFormActions: React.FC<KeyResultFormActionsProps> = ({ 
  onClose, 
  mode, 
  isPending 
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={(e) => {
          e.preventDefault();
          onClose(false);
        }}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isPending}
      >
        {isPending ? 'Saving...' : mode === 'create' ? 'Create Key Result' : 'Save Changes'}
      </Button>
    </div>
  );
};
