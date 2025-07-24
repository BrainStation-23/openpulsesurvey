import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface GenerateAIFeedbackButtonProps {
  campaignId: string;
  instanceId?: string;
}

interface ProcessingResult {
  supervisor_id: string;
  supervisor_name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function GenerateAIFeedbackButton({ campaignId, instanceId }: GenerateAIFeedbackButtonProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalSupervisors, setTotalSupervisors] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const handleGenerateFeedback = async () => {
    if (!instanceId) {
      toast({
        title: "Error",
        description: "Please select an instance first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setShowProgress(true);
      setProcessingResults([]);
      setCurrentProgress(0);
      
      // First, get all eligible supervisors
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .rpc('get_supervisors_with_min_reportees', { 
          min_reportees: 4,
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        });

      if (supervisorsError) {
        console.error('Error fetching supervisors:', supervisorsError);
        throw new Error('Failed to fetch supervisors');
      }

      if (!supervisorsData || supervisorsData.length === 0) {
        toast({
          title: "No Data",
          description: "No supervisors with minimum responses found for this campaign instance",
        });
        setIsGenerating(false);
        setShowProgress(false);
        return;
      }

      // Get supervisor profiles for names
      const supervisorIds = supervisorsData.map(s => s.supervisor_id);
      const { data: supervisorProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", supervisorIds);

      if (profileError) {
        console.error('Error fetching supervisor profiles:', profileError);
        throw new Error('Failed to fetch supervisor profiles');
      }

      // Create lookup for supervisor names
      const profilesMap = new Map();
      supervisorProfiles?.forEach(profile => {
        const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Supervisor';
        profilesMap.set(profile.id, name);
      });

      // Initialize processing results
      const initialResults: ProcessingResult[] = supervisorsData.map(supervisor => ({
        supervisor_id: supervisor.supervisor_id,
        supervisor_name: profilesMap.get(supervisor.supervisor_id) || 'Unknown Supervisor',
        status: 'pending'
      }));

      setProcessingResults(initialResults);
      setTotalSupervisors(supervisorsData.length);

      let successCount = 0;
      let errorCount = 0;

      // Process each supervisor individually
      for (let i = 0; i < supervisorsData.length; i++) {
        const supervisor = supervisorsData[i];
        const supervisorName = profilesMap.get(supervisor.supervisor_id) || 'Unknown Supervisor';

        // Update status to processing
        setProcessingResults(prev => 
          prev.map(result => 
            result.supervisor_id === supervisor.supervisor_id 
              ? { ...result, status: 'processing' }
              : result
          )
        );

        try {
          console.log(`Processing supervisor ${supervisor.supervisor_id} (${i + 1}/${supervisorsData.length})`);

          // Check if analysis already exists
          const { data: existingAnalysis, error: checkError } = await supabase
            .from('ai_feedback_analysis')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('instance_id', instanceId)
            .eq('supervisor_id', supervisor.supervisor_id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Error checking existing analysis: ${checkError.message}`);
          }

          if (existingAnalysis) {
            console.log(`Analysis already exists for supervisor ${supervisor.supervisor_id}, skipping`);
            
            // Update status to success (already existed)
            setProcessingResults(prev => 
              prev.map(result => 
                result.supervisor_id === supervisor.supervisor_id 
                  ? { ...result, status: 'success' }
                  : result
              )
            );
            successCount++;
          } else {
            // Call the analyze-reportee-feedback function directly
            const { data: analysisResult, error: analysisError } = await supabase.functions
              .invoke('analyze-reportee-feedback', {
                body: {
                  campaignId,
                  instanceId,
                  supervisorId: supervisor.supervisor_id
                }
              });

            if (analysisError) {
              throw new Error(`Analysis error: ${analysisError.message}`);
            }

            if (analysisResult?.success) {
              console.log(`Successfully generated analysis for supervisor ${supervisor.supervisor_id}`);
              
              // Update status to success
              setProcessingResults(prev => 
                prev.map(result => 
                  result.supervisor_id === supervisor.supervisor_id 
                    ? { ...result, status: 'success' }
                    : result
                )
              );
              successCount++;
            } else {
              throw new Error(analysisResult?.error || 'Unknown error occurred');
            }
          }
        } catch (error) {
          console.error(`Error processing supervisor ${supervisor.supervisor_id}:`, error);
          errorCount++;
          
          // Update status to error
          setProcessingResults(prev => 
            prev.map(result => 
              result.supervisor_id === supervisor.supervisor_id 
                ? { ...result, status: 'error', error: error.message }
                : result
            )
          );
        }

        // Update progress
        setCurrentProgress(i + 1);

        // Add delay between requests to avoid overwhelming the system
        if (i < supervisorsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log(`Completed processing: ${successCount} successful, ${errorCount} errors`);

      // Show completion toast
      if (errorCount === 0) {
        toast({
          title: "Success",
          description: `All ${successCount} manager feedback analyses generated successfully`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `${successCount} successful, ${errorCount} failed`,
          variant: errorCount > successCount ? "destructive" : "default"
        });
      }

    } catch (error) {
      console.error('Error generating manager feedback:', error);
      toast({
        title: "Error",
        description: "Failed to generate manager feedback",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      // Keep progress visible for review
      setTimeout(() => setShowProgress(false), 5000);
    }
  };

  const startHold = () => {
    if (isGenerating) return;
    
    setIsHolding(true);
    setHoldProgress(0);

    // Progress animation
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + 2; // 2% every 20ms = 100% in 1 second
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }
        return newProgress;
      });
    }, 20);

    // Trigger action after 1 second
    holdTimeoutRef.current = setTimeout(() => {
      handleGenerateFeedback();
      resetHold();
    }, 1000);
  };

  const resetHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const stopHold = () => {
    if (holdProgress < 100) {
      resetHold();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopHold();
  };

  const getStatusIcon = (status: ProcessingResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: ProcessingResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          disabled={!instanceId || isGenerating}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={handleMouseLeave}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          onMouseEnter={() => setIsHovered(true)}
          className={`gap-2 transition-all duration-200 ${
            isHolding ? 'scale-105 shadow-md' : ''
          }`}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Generate Manager Feedback"}
        </Button>
        
        {isHolding && (
          <div className="absolute -bottom-3 left-0 right-0">
            <Progress 
              value={holdProgress} 
              className="h-1 bg-muted"
              indicatorClassName="bg-primary transition-all duration-75"
            />
          </div>
        )}
        
        {!isGenerating && !isHolding && isHovered && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
            Hold for 1 second
          </div>
        )}
      </div>

      {showProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manager Feedback Generation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Progress: {currentProgress} of {totalSupervisors} managers
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentProgress / totalSupervisors) * 100)}% complete
                </span>
              </div>
              
              <Progress 
                value={(currentProgress / totalSupervisors) * 100} 
                className="w-full"
              />

              <ScrollArea className="h-64 w-full border rounded-md p-2">
                <div className="space-y-2">
                  {processingResults.map((result) => (
                    <div key={result.supervisor_id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.supervisor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        {result.error && (
                          <span className="text-xs text-red-500 max-w-xs truncate" title={result.error}>
                            {result.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
