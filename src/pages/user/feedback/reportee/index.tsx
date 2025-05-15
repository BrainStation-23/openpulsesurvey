
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ReporteeFeedbackPage() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reportee Feedback</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">
            This page allows you to view and manage feedback for your direct reportees.
            You can analyze responses, track progress, and identify areas for improvement.
          </p>
          
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No feedback data available</h3>
            <p className="text-muted-foreground max-w-md">
              Feedback data will appear here once your reportees have received and responded to feedback requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { MessageSquare } from 'lucide-react';
