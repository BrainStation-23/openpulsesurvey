
import React from 'react';
import { MoreHorizontal, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { KeyResult } from '@/types/okr';
import { CardHeader } from '@/components/ui/card';
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

  // Function to get the status color class
  const getStatusColorClass = (status: KeyResult['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'at_risk':
        return 'bg-red-50 text-red-700';
      case 'on_track':
        return 'bg-blue-50 text-blue-700';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700';
      default: // not_started
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <CardHeader className="pb-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium leading-tight">{keyResult.title}</h3>
          
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onEditClick}
              >
                <Edit className="h-4 w-4 text-blue-600 hover:text-blue-700" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onDeleteClick}
              >
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge 
            variant="outline" 
            className={getKrTypeColor(keyResult.krType)}
          >
            {keyResult.krType.charAt(0).toUpperCase() + keyResult.krType.slice(1)}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={getStatusColorClass(keyResult.status)}
          >
            {keyResult.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Badge>
          
          {keyResult.dueDate && (
            <DueDateDisplay 
              dueDate={keyResult.dueDate} 
              isCompleted={keyResult.status === 'completed'} 
              showIcon={true}
            />
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            {ownerName}
          </span>
          {keyResult.dueDate && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(keyResult.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
