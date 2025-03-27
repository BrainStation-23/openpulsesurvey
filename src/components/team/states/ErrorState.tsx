
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="h-[400px] border rounded-md flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <p className="text-sm text-muted-foreground">Error loading team data: {error.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
