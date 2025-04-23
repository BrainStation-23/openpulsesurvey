
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { TimePicker } from "@/components/ui/time-picker";

interface CronJob {
  id?: string;
  campaign_id: string;
  job_type: "activation" | "completion";
  job_name: string;
  cron_schedule: string;
  is_active: boolean;
  last_run: string | null;
  daily_check_time?: string; // New field for storing time
}

// Database response may have job_type as string
interface CronJobResponse {
  id: string;
  campaign_id: string;
  job_type: string;
  job_name: string;
  cron_schedule: string;
  is_active: boolean | null;
  last_run: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CronJobManagerProps {
  campaignId: string;
  onUpdated?: () => void;
  className?: string;
}

export const CronJobManager: React.FC<CronJobManagerProps> = ({ 
  campaignId, 
  onUpdated,
  className = ""
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('activation');

  const [activationJob, setActivationJob] = useState<CronJob>({
    campaign_id: campaignId,
    job_type: 'activation',
    job_name: '',
    cron_schedule: '0 9 * * *', // Default to 9 AM daily
    daily_check_time: '09:00',
    is_active: false,
    last_run: null
  });

  const [completionJob, setCompletionJob] = useState<CronJob>({
    campaign_id: campaignId,
    job_type: 'completion',
    job_name: '',
    cron_schedule: '0 17 * * *', // Default to 5 PM daily
    daily_check_time: '17:00',
    is_active: false,
    last_run: null
  });

  // Get current cron jobs
  const { data: cronJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['campaign-cron-jobs', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_cron_jobs')
        .select('*')
        .eq('campaign_id', campaignId);
        
      if (error) throw error;
      return data as CronJobResponse[];
    }
  });

  // Update jobs when data loads
  useEffect(() => {
    if (cronJobs && cronJobs.length > 0) {
      cronJobs.forEach(job => {
        // Extract time from cron schedule (format: "0 HH * * *")
        const cronParts = job.cron_schedule.split(' ');
        let timeString = '09:00'; // Default time
        
        if (cronParts.length >= 3 && !isNaN(parseInt(cronParts[1]))) {
          const hour = parseInt(cronParts[1]);
          timeString = `${hour.toString().padStart(2, '0')}:00`;
        }

        if (job.job_type === 'activation') {
          setActivationJob({
            ...job,
            job_type: 'activation', // Ensure correct typed value
            is_active: job.is_active ?? false, // Ensure non-null boolean
            daily_check_time: timeString
          });
        } else if (job.job_type === 'completion') {
          setCompletionJob({
            ...job,
            job_type: 'completion', // Ensure correct typed value
            is_active: job.is_active ?? false, // Ensure non-null boolean
            daily_check_time: timeString
          });
        }
      });
    }
  }, [cronJobs]);

  // Format time to cron schedule
  const formatTimeToCron = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${minutes} ${hours} * * *`;
  };

  // Update/create cron job
  const updateCronJobMutation = useMutation({
    mutationFn: async (job: CronJob) => {
      // Generate cron schedule from time
      const cronSchedule = formatTimeToCron(job.daily_check_time || '09:00');
      
      const { data, error } = await supabase.rpc('manage_instance_cron_job', {
        p_campaign_id: job.campaign_id,
        p_job_type: job.job_type,
        p_cron_schedule: cronSchedule,
        p_is_active: job.is_active
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cron-jobs', campaignId] });
      if (onUpdated) onUpdated();
      toast({
        title: "Success",
        description: "Automation settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update automation settings: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Run job manually
  const runJobMutation = useMutation({
    mutationFn: async ({ campaignId, jobType }: { campaignId: string, jobType: 'activation' | 'completion' }) => {
      const { data, error } = await supabase.rpc('run_instance_job_now', {
        p_campaign_id: campaignId,
        p_job_type: jobType
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-instances', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-cron-jobs', campaignId] });
      
      const jobTypeLabel = variables.jobType === 'activation' ? 'activation' : 'completion';
      const count = typeof data === 'number' ? data : 0;
      
      toast({
        title: "Job executed",
        description: `${count} instances ${jobTypeLabel === 'activation' ? 'activated' : 'completed'}.`,
      });
      
      if (onUpdated) onUpdated();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to run job: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleToggleJob = (jobType: 'activation' | 'completion', isActive: boolean) => {
    if (jobType === 'activation') {
      const updatedJob = { ...activationJob, is_active: isActive };
      setActivationJob(updatedJob);
      updateCronJobMutation.mutate(updatedJob);
    } else {
      const updatedJob = { ...completionJob, is_active: isActive };
      setCompletionJob(updatedJob);
      updateCronJobMutation.mutate(updatedJob);
    }
  };

  const handleTimeChange = (jobType: 'activation' | 'completion', time: string) => {
    if (jobType === 'activation') {
      setActivationJob(prev => ({ 
        ...prev, 
        daily_check_time: time,
        cron_schedule: formatTimeToCron(time)
      }));
    } else {
      setCompletionJob(prev => ({ 
        ...prev, 
        daily_check_time: time,
        cron_schedule: formatTimeToCron(time)
      }));
    }
  };

  const handleSaveSchedule = (jobType: 'activation' | 'completion') => {
    if (jobType === 'activation') {
      updateCronJobMutation.mutate(activationJob);
    } else {
      updateCronJobMutation.mutate(completionJob);
    }
  };

  const handleRunNow = (jobType: 'activation' | 'completion') => {
    runJobMutation.mutate({ campaignId, jobType });
  };

  // Calculate next run time for display
  const getNextRunTime = (cronSchedule: string) => {
    const cronParts = cronSchedule.split(' ');
    if (cronParts.length < 3) return 'Unknown';
    
    const minute = parseInt(cronParts[0]);
    const hour = parseInt(cronParts[1]);
    
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(hour, minute, 0, 0);
    
    // If the scheduled time for today has already passed, show tomorrow's time
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return format(nextRun, "MMM d, yyyy 'at' HH:mm");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Instance Automation
        </CardTitle>
        <CardDescription>
          Automatically manage instance status with daily checks at set times
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="activation" className="flex-1">Activation</TabsTrigger>
          <TabsTrigger value="completion" className="flex-1">Completion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activation" className="space-y-4 mt-4">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activation-enabled">Automatic Activation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically mark instances as active based on start date
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activationJob.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  <Switch 
                    id="activation-enabled"
                    checked={activationJob.is_active}
                    onCheckedChange={(checked) => handleToggleJob('activation', checked)}
                    disabled={updateCronJobMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activation-schedule">Daily Check Time</Label>
                <TimePicker
                  value={activationJob.daily_check_time || '09:00'}
                  onChange={(time) => handleTimeChange('activation', time)}
                  className="w-full"
                  // We need to remove the disabled prop as it's not in TimePickerProps
                />
                <p className="text-xs text-muted-foreground">
                  The system will check for instances to activate once daily at this time.
                  {!activationJob.is_active && " Enable automatic activation to apply this schedule."}
                </p>
              </div>
              
              {activationJob.is_active && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium">Next scheduled check:</p>
                  <p className="text-sm text-muted-foreground">
                    {getNextRunTime(activationJob.cron_schedule)}
                  </p>
                </div>
              )}
              
              {activationJob.last_run && (
                <p className="text-sm text-muted-foreground">
                  Last run: {format(new Date(activationJob.last_run), "MMM d, yyyy HH:mm:ss")}
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={() => handleSaveSchedule('activation')}
              disabled={updateCronJobMutation.isPending}
            >
              Apply Changes
            </Button>
            
            <Button 
              onClick={() => handleRunNow('activation')}
              disabled={runJobMutation.isPending}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Run Now
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="completion" className="space-y-4 mt-4">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="completion-enabled">Automatic Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically mark instances as completed based on end date
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {completionJob.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  <Switch 
                    id="completion-enabled"
                    checked={completionJob.is_active}
                    onCheckedChange={(checked) => handleToggleJob('completion', checked)}
                    disabled={updateCronJobMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completion-schedule">Daily Check Time</Label>
                <TimePicker
                  value={completionJob.daily_check_time || '17:00'}
                  onChange={(time) => handleTimeChange('completion', time)}
                  className="w-full"
                  // We need to remove the disabled prop as it's not in TimePickerProps
                />
                <p className="text-xs text-muted-foreground">
                  The system will check for instances to complete once daily at this time.
                  {!completionJob.is_active && " Enable automatic completion to apply this schedule."}
                </p>
              </div>
              
              {completionJob.is_active && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium">Next scheduled check:</p>
                  <p className="text-sm text-muted-foreground">
                    {getNextRunTime(completionJob.cron_schedule)}
                  </p>
                </div>
              )}
              
              {completionJob.last_run && (
                <p className="text-sm text-muted-foreground">
                  Last run: {format(new Date(completionJob.last_run), "MMM d, yyyy HH:mm:ss")}
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={() => handleSaveSchedule('completion')}
              disabled={updateCronJobMutation.isPending}
            >
              Apply Changes
            </Button>
            
            <Button 
              onClick={() => handleRunNow('completion')}
              disabled={runJobMutation.isPending}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Run Now
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
