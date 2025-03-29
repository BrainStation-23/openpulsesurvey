
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { KeyResult } from '@/types/okr';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOwnerInfo } from '../hooks/useOwnerInfo';
import { DueDateDisplay } from './DueDateDisplay';

interface KeyResultHeaderProps {
  keyResult: KeyResult;
  canEdit: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const KeyResultHeader: React.FC<KeyResultHeaderProps> = ({
  keyResult,
  canEdit,
  onEditClick,
  onDeleteClick
}) => {
  const { ownerName } = useOwnerInfo(keyResult.ownerId);
  
  const getKrTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'committed':
        return 'bg-blue-50 text-blue-700';
      case 'aspirational':
        return 'bg-purple-50 text-purple-700';
      default: // standard
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div>
        <CardTitle className="text-lg font-medium flex items-center flex-wrap gap-2">
          {keyResult.title}
          <Badge 
            variant="outline" 
            className={getKrTypeColor(keyResult.krType)}
          >
            {keyResult.krType.charAt(0).toUpperCase() + keyResult.krType.slice(1)}
          </Badge>
          
          {keyResult.dueDate && (
            <DueDateDisplay 
              dueDate={keyResult.dueDate} 
              isCompleted={keyResult.status === 'completed'} 
            />
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Owned by: {ownerName}</p>
      </div>
      
      {canEdit && (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </CardHeader>
  );
};
