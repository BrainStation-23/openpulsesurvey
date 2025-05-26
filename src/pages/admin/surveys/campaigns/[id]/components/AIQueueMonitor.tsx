
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export function AIQueueMonitor() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Analysis Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="rounded-full bg-muted p-6 mx-auto mb-4 w-fit">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">AI Feedback System</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI feedback is automatically generated for supervisors when campaign instances are completed.
            Use the "Generate AI Feedback" button to manually trigger analysis for the selected instance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
