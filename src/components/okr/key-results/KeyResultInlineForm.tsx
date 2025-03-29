
import React from 'react';
import { KeyResult } from '@/types/okr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyResultForm } from './KeyResultForm';

interface KeyResultInlineFormProps {
  objectiveId: string;
  keyResult?: KeyResult;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export const KeyResultInlineForm: React.FC<KeyResultInlineFormProps> = ({
  objectiveId,
  keyResult,
  onClose,
  mode
}) => {
  const handleFormClose = (success?: boolean) => {
    onClose();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>{mode === 'create' ? 'Add New Key Result' : 'Edit Key Result'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <KeyResultForm
          objectiveId={objectiveId}
          keyResult={keyResult}
          onClose={handleFormClose}
          mode={mode}
        />
      </CardContent>
    </Card>
  );
};
