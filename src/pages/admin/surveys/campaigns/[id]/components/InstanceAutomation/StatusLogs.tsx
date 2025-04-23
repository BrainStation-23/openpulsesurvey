
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface StatusLogsProps {
  className?: string;
}

export const StatusLogs: React.FC<StatusLogsProps> = ({ className = "" }) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['campaign-instance-status-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_instance_status_logs')
        .select('*')
        .order('run_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Status Changes</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <p>Loading logs...</p>
        ) : logs?.length ? (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="border-b pb-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {format(new Date(log.run_at), "MMM d, yyyy HH:mm:ss")}
                  </span>
                  <div className="flex gap-2">
                    {log.updated_to_active > 0 && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {log.updated_to_active} Activated
                      </Badge>
                    )}
                    {log.updated_to_completed > 0 && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        {log.updated_to_completed} Completed
                      </Badge>
                    )}
                  </div>
                </div>
                
                {log.details && (
                  <div className="text-sm text-muted-foreground">
                    {log.details.execution_details}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No status change logs available</p>
        )}
      </CardContent>
    </Card>
  );
};
