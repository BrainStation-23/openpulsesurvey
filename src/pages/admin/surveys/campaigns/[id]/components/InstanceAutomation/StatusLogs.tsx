
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Clock } from "lucide-react";

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

  // Helper function to safely render details
  const renderLogDetails = (details: any) => {
    if (typeof details === 'object') {
      // If details is an object with execution_details
      if ('execution_details' in details) {
        return typeof details.execution_details === 'string' 
          ? details.execution_details 
          : JSON.stringify(details.execution_details, null, 2);
      }
      // If details is a general object
      return JSON.stringify(details, null, 2);
    }
    // If details is already a string
    return details || 'Job executed successfully';
  };

  // Helper function to get job type from log entry
  const getJobType = (log: any): string => {
    if (!log.details || typeof log.details !== 'object') return '';
    
    if (log.updated_to_active > 0) return 'Activation Check';
    if (log.updated_to_completed > 0) return 'Completion Check';
    
    return 'Status Check';
  };

  // Helper to determine if the check was manual or scheduled
  const isManualCheck = (details: any): boolean => {
    if (!details || typeof details !== 'object') return false;
    return details.trigger_type === 'manual';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Status Changes
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <p>Loading logs...</p>
        ) : logs?.length ? (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="border-b pb-3">
                <div className="flex justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(log.run_at), "MMM d, yyyy HH:mm:ss")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getJobType(log)} {isManualCheck(log.details) && '(Manual)'}
                    </span>
                  </div>
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
                    {log.updated_to_active === 0 && log.updated_to_completed === 0 && (
                      <Badge variant="outline">
                        No Changes
                      </Badge>
                    )}
                  </div>
                </div>
                
                {log.details && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {renderLogDetails(log.details)}
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
