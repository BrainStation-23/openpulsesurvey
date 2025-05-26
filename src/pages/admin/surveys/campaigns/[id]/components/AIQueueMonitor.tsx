
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIQueueMonitorProps {
  campaignId: string;
}

interface QueueItem {
  id: string;
  campaign_id: string;
  instance_id: string;
  supervisor_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  scheduled_for: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export function AIQueueMonitor({ campaignId }: AIQueueMonitorProps) {
  const queryClient = useQueryClient();

  // Fetch queue items for this campaign
  const { data: queueItems, isLoading, refetch } = useQuery({
    queryKey: ['ai-queue', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analysis_queue')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QueueItem[];
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Process queue mutation
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-ai-analysis-queue');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed_count} items from queue`);
      queryClient.invalidateQueries({ queryKey: ['ai-queue'] });
    },
    onError: (error) => {
      toast.error(`Failed to process queue: ${error.message}`);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const statusCounts = queueItems?.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            AI Analysis Queue
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => processQueueMutation.mutate()}
              disabled={processQueueMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Process Queue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {getStatusIcon(status)}
                <Badge variant={getStatusColor(status) as any}>
                  {status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>

        {/* Queue Items */}
        <div className="space-y-2">
          <h4 className="font-medium">Recent Queue Items</h4>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : queueItems && queueItems.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queueItems.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-medium">
                        Instance {item.instance_id.slice(0, 8)}...
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Supervisor: {item.supervisor_id.slice(0, 8)}...
                      </div>
                      {item.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {item.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(item.status) as any}>
                      {item.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Attempt {item.attempts}/{item.max_attempts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.scheduled_for).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No queue items found for this campaign
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
