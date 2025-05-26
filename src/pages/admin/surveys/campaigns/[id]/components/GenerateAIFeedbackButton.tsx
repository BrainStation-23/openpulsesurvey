
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface GenerateAIFeedbackButtonProps {
  campaignId: string;
  instanceId?: string;
}

export function GenerateAIFeedbackButton({ campaignId, instanceId }: GenerateAIFeedbackButtonProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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
      
      const { error } = await supabase.functions.invoke('generate-supervisor-feedback', {
        body: {
          campaignId: campaignId,
          instanceId: instanceId
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Manager feedback generation started",
      });
    } catch (error) {
      console.error('Error generating manager feedback:', error);
      toast({
        title: "Error",
        description: "Failed to generate manager feedback",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={!instanceId || isGenerating}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          stopHold();
        }}
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
  );
}
