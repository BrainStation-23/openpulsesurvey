
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { TimePicker } from "@/components/ui/time-picker";
import { useInstanceManagement } from "../../hooks/useInstanceManagement";

interface CronJob {
  id?: string;
  campaign_id: string;
  job_type: "activation" | "completion";
  job_name: string;
  cron_schedule: string;
  is_active: boolean;
  last_run: string | null;
  daily_check_time?: string;
}

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

/**
 * Convert a "HH:mm" string from the time picker to a cron schedule string
 * This automatically handles time zone conversion from local time to UTC for cron
 * @param timeString The local time in "HH:mm" format
 * @param referenceDate Optional date with timezone info to use (for instance dates)
 * @returns Cron schedule string (minute hour * * *)
 */
function formatTimeToCron(timeString: string, referenceDate?: string | Date): string {
  // If no time provided, default to 9am local
  if (!timeString) return '0 9 * * *';
  
  // Extract local hours and minutes from the time string
  const [localHours, localMinutes] = timeString.split(':').map(Number);
  
  // Calculate UTC time based on local time
  const now = referenceDate ? new Date(referenceDate) : new Date();
  
  // Create a date object with today's date and the specified local time
  const localDate = new Date(now);
  localDate.setHours(localHours, localMinutes, 0, 0);
  
  // Get the UTC hours and minutes
  const utcMinutes = localDate.getUTCMinutes();
  const utcHours = localDate.getUTCHours();
  
  // Format as cron schedule: "minute hour * * *"
  return `${utcMinutes} ${utcHours} * * *`;
}

/**
 * Convert a cron schedule string to a local time "HH:mm" string
 * This reverses the UTC conversion for display in the UI
 */
function cronToLocalTime(cronSchedule: string): string {
  if (!cronSchedule || cronSchedule.split(' ').length < 2) {
    return '09:00'; // Default to 9am if invalid cron
  }
  
  const parts = cronSchedule.split(' ');
  const utcMinutes = parseInt(parts[0]);
  const utcHours = parseInt(parts[1]);
  
  // Create a Date object with the UTC time
  const date = new Date();
  date.setUTCHours(utcHours, utcMinutes, 0, 0);
  
  // Format to local time
  const localHours = date.getHours().toString().padStart(2, '0');
  const localMinutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${localHours}:${localMinutes}`;
}

export const CronJobManager: React.FC<CronJobManagerProps> = ({ 
  campaignId, 
  onUpdated,
  className = ""
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('activation');

  // Get instances for upcoming instance card
  const { instances, isLoading: isLoadingInst } = useInstanceManagement(campaignId);

  // Find the most upcoming instance (status upcoming, earliest future starts_at)
  const nextUpcomingInstance = React.useMemo(() => {
    const upcoming = (instances || []).filter(i => i.status === "upcoming" && new Date(i.starts_at) > new Date());
    if (!upcoming.length) return null;
    // Sort by starts_at ascending
    return upcoming.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
  }, [instances]);

  // cron job states
  const [activationJob, setActivationJob] = useState<CronJob>({
    campaign_id: campaignId,
    job_type: 'activation',
    job_name: '',
    cron_schedule: '0 9 * * *',
    daily_check_time: '09:00',
    is_active: false,
    last_run: null
  });

  const [completionJob, setCompletionJob] = useState<CronJob>({
    campaign_id: campaignId,
    job_type: 'completion',
    job_name: '',
    cron_schedule: '0 17 * * *',
    daily_check_time: '17:00',
    is_active: false,
    last_run: null
  });

  // Fetch cron jobs from db
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

  useEffect(() => {
    if (cronJobs && cronJobs.length > 0) {
      cronJobs.forEach(job => {
        // Convert the stored UTC cron schedule to local time for display
        const localTimeString = cronToLocalTime(job.cron_schedule);
        
        if (job.job_type === 'activation') {
          setActivationJob({
            ...job,
            job_type: 'activation',
            is_active: job.is_active ?? false,
            daily_check_time: localTimeString
          });
        } else if (job.job_type === 'completion') {
          setCompletionJob({
            ...job,
            job_type: 'completion',
            is_active: job.is_active ?? false,
            daily_check_time: localTimeString
          });
        }
      });
    }
  }, [cronJobs]);

  // --- Mutations ---
  const updateCronJobMutation = useMutation({
    mutationFn: async (job: CronJob) => {
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
    // Only update the local time display in the state
    if (jobType === 'activation') {
      setActivationJob(prev => ({ 
        ...prev, 
        daily_check_time: time
      }));
    } else {
      setCompletionJob(prev => ({ 
        ...prev, 
        daily_check_time: time
      }));
    }
  };

  const handleSaveSchedule = (jobType: 'activation' | 'completion') => {
    // When saving, the time will be converted to UTC
    if (jobType === 'activation') {
      updateCronJobMutation.mutate(activationJob);
    } else {
      updateCronJobMutation.mutate(completionJob);
    }
  };

  const handleRunNow = (jobType: 'activation' | 'completion') => {
    runJobMutation.mutate({ campaignId, jobType });
  };

  // Quick Configure Automation for upcoming instance
  const handleQuickAutomation = () => {
    if (!nextUpcomingInstance) return;
    
    // Use instance's TZ to set correct UTC-based cron
    const startDT = new Date(nextUpcomingInstance.starts_at);
    const endDT = new Date(nextUpcomingInstance.ends_at);

    // Get local time strings for display
    const startHour = startDT.getHours().toString().padStart(2, '0');
    const startMinute = startDT.getMinutes().toString().padStart(2, '0');
    const endHour = endDT.getHours().toString().padStart(2, '0');
    const endMinute = endDT.getMinutes().toString().padStart(2, '0');
    const activationTime = `${startHour}:${startMinute}`;
    const completionTime = `${endHour}:${endMinute}`;

    // Set on state and set as active
    setActivationJob(prev => ({
      ...prev,
      daily_check_time: activationTime,
      is_active: true,
    }));
    setCompletionJob(prev => ({
      ...prev,
      daily_check_time: completionTime,
      is_active: true,
    }));

    // Send correct UTC based cron to DB
    updateCronJobMutation.mutate({ 
      ...activationJob, 
      daily_check_time: activationTime,
      is_active: true 
    });
    updateCronJobMutation.mutate({ 
      ...completionJob, 
      job_type: "completion", 
      daily_check_time: completionTime,
      is_active: true 
    });
    toast({
      title: "Quick Configured!",
      description: "Automation enabled and times set to upcoming instance's start/end with correct time zone.",
    });
  };

  // Show AM/PM for times
  const formatTo12h = (dateOrString: Date | string) => {
    const dateObj = typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
    // e.g. Apr 22, 2025 at 06:15 PM
    return format(dateObj, "MMM d, yyyy 'at' hh:mm a");
  };

  // Card: Upcoming instance block
  function UpcomingInstanceCard() {
    if (!nextUpcomingInstance) {
      return (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>No Upcoming Instance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">There are no upcoming instances scheduled to be activated.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6 border-primary/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Next Upcoming Instance: <span className="ml-2 font-semibold">Period&nbsp;{nextUpcomingInstance.period_number}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 md:gap-8">
            <div>
              <div className="text-xs text-muted-foreground">Start Date/Time</div>
              <div className="font-medium">{formatTo12h(nextUpcomingInstance.starts_at)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">End Date/Time</div>
              <div className="font-medium">{formatTo12h(nextUpcomingInstance.ends_at)}</div>
            </div>
            <div className="flex-1 flex items-end justify-end">
              <Button 
                size="sm"
                onClick={handleQuickAutomation}
                variant="outline"
                className="mt-2 md:mt-0"
              >
                Quick Configure Automation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getNextRunTime = (cronSchedule: string) => {
    // Get the local time display for this cron schedule
    const localTimeString = cronToLocalTime(cronSchedule);
    const [hours, minutes] = localTimeString.split(':').map(Number);
    
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Show as 12h format
    return format(nextRun, "MMM d, yyyy 'at' hh:mm a");
  };

  // Function to display equivalent UTC time
  const getUtcTimeDisplay = (localTimeString: string) => {
    if (!localTimeString) return 'Unknown';
    
    const [hours, minutes] = localTimeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    const utcHours = date.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${utcHours}:${utcMinutes} UTC`;
  };

  return (
    <div>
      <UpcomingInstanceCard />
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
                  <Label htmlFor="activation-schedule">Daily Check Time (Your Local Time)</Label>
                  <TimePicker
                    value={activationJob.daily_check_time || '09:00'}
                    onChange={(time) => handleTimeChange('activation', time)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    The system will check for instances to activate once daily at this time.
                    {!activationJob.is_active && " Enable automatic activation to apply this schedule."}
                  </p>
                  {activationJob.daily_check_time && (
                    <p className="text-xs text-muted-foreground">
                      Server will run at: {getUtcTimeDisplay(activationJob.daily_check_time)}
                    </p>
                  )}
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
                    Last run: {format(new Date(activationJob.last_run), "MMM d, yyyy hh:mm:ss a")}
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
                  <Label htmlFor="completion-schedule">Daily Check Time (Your Local Time)</Label>
                  <TimePicker
                    value={completionJob.daily_check_time || '17:00'}
                    onChange={(time) => handleTimeChange('completion', time)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    The system will check for instances to complete once daily at this time.
                    {!completionJob.is_active && " Enable automatic completion to apply this schedule."}
                  </p>
                  {completionJob.daily_check_time && (
                    <p className="text-xs text-muted-foreground">
                      Server will run at: {getUtcTimeDisplay(completionJob.daily_check_time)}
                    </p>
                  )}
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
                    Last run: {format(new Date(completionJob.last_run), "MMM d, yyyy hh:mm:ss a")}
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
    </div>
  );
};
