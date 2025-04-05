
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface RelationshipsCardProps {
  cycleId?: string;
  sbuId?: string;
  isAdmin: boolean;
  onNavigateToCycle: () => void;
  onNavigateToSBU: () => void;
}

export const RelationshipsCard: React.FC<RelationshipsCardProps> = ({
  cycleId,
  sbuId,
  isAdmin,
  onNavigateToCycle,
  onNavigateToSBU
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Relationships</h3>

        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">OKR Cycle</h4>
          <Button 
            variant="link" 
            className="flex items-center p-0 h-auto text-primary"
            onClick={onNavigateToCycle}
          >
            View Cycle <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {sbuId && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Business Unit</h4>
            <Button 
              variant="link" 
              className="flex items-center p-0 h-auto text-primary"
              onClick={onNavigateToSBU}
            >
              View SBU <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
