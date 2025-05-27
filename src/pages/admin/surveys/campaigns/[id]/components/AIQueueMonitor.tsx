
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIQueueMonitorProps {
  instanceStatus?: 'active' | 'completed' | 'upcoming';
  selectedInstanceId?: string;
}

export function AIQueueMonitor({ instanceStatus, selectedInstanceId }: AIQueueMonitorProps) {
  const getStatusInfo = () => {
    if (!selectedInstanceId) {
      return {
        icon: AlertCircle,
        status: 'No Instance Selected',
        description: 'Please select a campaign instance to see manager feedback status.',
        variant: 'secondary' as const,
        color: 'text-muted-foreground'
      };
    }

    switch (instanceStatus) {
      case 'completed':
        return {
          icon: CheckCircle,
          status: 'Ready for Manager Feedback',
          description: 'This completed instance is ready for manager feedback generation. Use the "Generate Manager Feedback" button above.',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'active':
        return {
          icon: Clock,
          status: 'Instance Active',
          description: 'Manager feedback can only be generated after the instance is completed.',
          variant: 'secondary' as const,
          color: 'text-blue-600'
        };
      case 'upcoming':
        return {
          icon: Clock,
          status: 'Instance Upcoming',
          description: 'Manager feedback will be available once the instance is completed.',
          variant: 'outline' as const,
          color: 'text-amber-600'
        };
      default:
        return {
          icon: AlertCircle,
          status: 'Unknown Status',
          description: 'Unable to determine instance status.',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Manager Feedback Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="rounded-full bg-muted p-6 mx-auto mb-4 w-fit">
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
          </div>
          <div className="mb-4">
            <Badge variant={statusInfo.variant} className="mb-2">
              {statusInfo.status}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {statusInfo.description}
          </p>
          
          <div className="bg-muted/50 border rounded-lg p-4 text-left">
            <h4 className="font-medium mb-2">How Manager Feedback Works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Only available for completed campaign instances</li>
              <li>• Generates feedback for supervisors with 4+ reportees</li>
              <li>• Hold the button for 1 second to prevent accidental triggers</li>
              <li>• Processing may take several minutes depending on data volume</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
