
import React from 'react';
import { KeyResult } from '@/types/okr';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KeyResultStatusBadge } from '../KeyResultStatusBadge';
import { useOwnerInfo } from '../hooks/useOwnerInfo';

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

  return (
    <CardHeader className="pb-3">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{keyResult.title}</CardTitle>
            <KeyResultStatusBadge status={keyResult.status} />
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Weight: {keyResult.weight.toFixed(1)}
            </Badge>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onEditClick}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Key Result</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onDeleteClick}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Key Result</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-3 w-3 mr-1" /> 
          <span>Owner: {ownerName}</span>
        </div>
        <Separator className="my-1" />
      </div>
    </CardHeader>
  );
};
