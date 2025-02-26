import { Card } from "@/components/ui/card";
import { AlertCircle, PlayCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LivePieChart } from "../charts/LivePieChart";
import { LiveBarChart } from "../charts/LiveBarChart";
import { LiveWordCloud } from "../charts/LiveWordCloud";
import { LiveSessionQuestion } from "../charts/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

interface ActiveQuestionSlideProps {
  currentActiveQuestion: LiveSessionQuestion | null;
  responses: any[];
  isActive: boolean;
  isSessionActive: boolean;
}

export function ActiveQuestionSlide({ currentActiveQuestion, responses, isActive, isSessionActive }: ActiveQuestionSlideProps) {
  const { toast } = useToast();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnableQuestion = async () => {
    if (!currentActiveQuestion) return;
    
    setIsEnabling(true);
    try {
      // First mark any currently active questions as completed
      const { error: completionError } = await supabase
        .from("live_session_questions")
        .update({
          status: "completed",
          disabled_at: new Date().toISOString()
        })
        .eq("session_id", currentActiveQuestion.session_id)
        .eq("status", "active");

      if (completionError) throw completionError;

      // Enable this specific question
      const { error: activationError } = await supabase
        .from("live_session_questions")
        .update({
          status: "active",
          enabled_at: new Date().toISOString()
        })
        .eq("id", currentActiveQuestion.id);

      if (activationError) throw activationError;

      toast({
        title: "Question enabled",
        description: `Question "${currentActiveQuestion.question_data.title}" is now active`,
      });
    } catch (error) {
      console.error("Error enabling question:", error);
      toast({
        title: "Error",
        description: "Failed to enable question",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  // Subscribe to question status changes
  useEffect(() => {
    if (!currentActiveQuestion) return;

    const channel = supabase
      .channel(`question_status_${currentActiveQuestion.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_questions',
          filter: `id=eq.${currentActiveQuestion.id}`
        },
        (payload) => {
          console.log('Question status update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentActiveQuestion?.id]);

  const renderResponseVisualization = () => {
    if (!currentActiveQuestion || !responses.length) return null;

    const processedResponses = responses.map(r => {
      const response = r.response_data.response;
      if (typeof response === 'string' && !isNaN(Number(response))) {
        return Number(response);
      }
      return response;
    });
    
    switch (currentActiveQuestion.question_data.type) {
      case 'boolean': {
        const yesCount = processedResponses.filter(r => r === 'true' || r === true).length;
        const noCount = processedResponses.filter(r => r === 'false' || r === false).length;
        const total = yesCount + noCount;
        
        const data = [
          { value: true, count: yesCount, percentage: total > 0 ? (yesCount / total) * 100 : 0, timestamp: Date.now() },
          { value: false, count: noCount, percentage: total > 0 ? (noCount / total) * 100 : 0, timestamp: Date.now() }
        ];
        
        return <LivePieChart data={data} total={total} />;
      }
      
      case 'rating': {
        const validResponses = processedResponses.filter((r): r is number => 
          (typeof r === 'number' || (typeof r === 'string' && !isNaN(Number(r)))) &&
          Number(r) >= 1 && Number(r) <= 5
        ).map(r => Number(r));
        
        const total = validResponses.length;
        const counts = Array.from({ length: 5 }, (_, i) => {
          const rating = i + 1;
          const count = validResponses.filter(r => r === rating).length;
          return {
            rating,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
            timestamp: Date.now()
          };
        });
        
        return <LiveBarChart data={counts} />;
      }
      
      case 'text':
      case 'comment': {
        const words = processedResponses
          .filter((text): text is string => typeof text === 'string')
          .flatMap(text => 
            text.toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/)
              .filter(word => word.length > 2)
          )
          .reduce((acc: { text: string; value: number; percentage: number; timestamp: number }[], word) => {
            const existing = acc.find(w => w.text === word);
            if (existing) {
              existing.value++;
            } else {
              acc.push({ 
                text: word, 
                value: 1, 
                percentage: 0,
                timestamp: Date.now()
              });
            }
            return acc;
          }, [])
          .map(word => ({
            ...word,
            percentage: (word.value / processedResponses.length) * 100
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 30);
          
        return <LiveWordCloud data={words} />;
      }
      
      default:
        return null;
    }
  };

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {currentActiveQuestion ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {currentActiveQuestion.question_data.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {currentActiveQuestion.status.charAt(0).toUpperCase() + currentActiveQuestion.status.slice(1)}
                  </p>
                </div>
                {currentActiveQuestion.status === "pending" && (
                  <Button
                    onClick={handleEnableQuestion}
                    disabled={!isSessionActive || isEnabling}
                    className="gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {isEnabling ? "Enabling..." : "Enable Question"}
                  </Button>
                )}
              </div>
              
              {typeof currentActiveQuestion.question_data.description === 'string' && (
                <p className="text-muted-foreground">
                  {currentActiveQuestion.question_data.description}
                </p>
              )}
              
              <div className="mt-8">
                {responses.length > 0 ? (
                  <div className="w-full max-w-4xl mx-auto">
                    {renderResponseVisualization()}
                    <div className="text-center text-muted-foreground mt-4">
                      {responses.length} responses received
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Waiting for responses...
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Question</AlertTitle>
            <AlertDescription>
              Enable a question from the Question Manager to start collecting responses.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
