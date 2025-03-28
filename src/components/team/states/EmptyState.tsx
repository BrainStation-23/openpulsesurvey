
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="h-[400px] border rounded-md flex items-center justify-center">
          <div className="text-center space-y-3">
            <InfoIcon className="h-10 w-10 text-blue-500 mx-auto" />
            <p className="text-sm text-muted-foreground">No team data available</p>
            <p className="text-xs text-muted-foreground max-w-md">
              There's no supervisor assigned to your profile or you don't have any team members.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
