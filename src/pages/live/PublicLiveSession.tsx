
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface ActiveQuestion {
  id: string;
  question_key: string;
  question_data: {
    title: string;
    type: string;
    choices?: { text: string; value: string; }[];
  };
}

interface ParticipantInfo {
  participantId: string;
  displayName: string;
}

export default function PublicLiveSession() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);

  useEffect(() => {
    const storedInfo = localStorage.getItem(`live_session_${joinCode}`);
    if (!storedInfo) {
      navigate(`/live/${joinCode}/join`);
      return;
    }
    setParticipantInfo(JSON.parse(storedInfo));
  }, [joinCode, navigate]);

  useEffect(() => {
    const setupSession = async () => {
      try {
        const { data: session, error: sessionError } = await supabase
          .from("live_survey_sessions")
          .select("id, status")
          .eq("join_code", joinCode)
          .single();

        if (sessionError || !session) {
          throw new Error("Session not found");
        }

        if (session.status === "ended") {
          throw new Error("This session has ended");
        }

        setSessionId(session.id);

        // Get active question
        const { data: questions, error: questionError } = await supabase
          .from("live_session_questions")
          .select("*")
          .eq("session_id", session.id)
          .eq("status", "active")
          .single();

        if (!questionError && questions) {
          // Transform the data to match ActiveQuestion interface
          const transformedQuestion: ActiveQuestion = {
            id: questions.id,
            question_key: questions.question_key,
            question_data: questions.question_data as ActiveQuestion['question_data']
          };
          setActiveQuestion(transformedQuestion);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Unable to join session",
          variant: "destructive",
        });
        navigate("/live");
      } finally {
        setIsLoading(false);
      }
    };

    setupSession();
  }, [joinCode, toast, navigate]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_questions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.status === "active") {
            // Transform the payload data to match ActiveQuestion interface
            const transformedQuestion: ActiveQuestion = {
              id: payload.new.id,
              question_key: payload.new.question_key,
              question_data: payload.new.question_data as ActiveQuestion['question_data']
            };
            setActiveQuestion(transformedQuestion);
            setResponse("");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleSubmitResponse = async () => {
    if (!activeQuestion || !participantInfo || !response.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("live_session_responses")
        .insert({
          session_id: sessionId,
          participant_id: participantInfo.participantId,
          question_key: activeQuestion.question_key,
          response_data: { response }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your response has been submitted",
      });
      setResponse("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderResponseInput = () => {
    if (!activeQuestion) return null;

    switch (activeQuestion.question_data.type) {
      case 'boolean':
        return (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setResponse('true')}
              variant={response === 'true' ? 'default' : 'outline'}
              disabled={isSubmitting}
            >
              Yes
            </Button>
            <Button
              onClick={() => setResponse('false')}
              variant={response === 'false' ? 'default' : 'outline'}
              disabled={isSubmitting}
            >
              No
            </Button>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2 justify-center flex-wrap">
            {[1, 2, 3, 4, 5].map((number) => (
              <Button
                key={number}
                onClick={() => setResponse(number.toString())}
                variant={response === number.toString() ? 'default' : 'outline'}
                disabled={isSubmitting}
                className="w-12 h-12"
              >
                {number}
              </Button>
            ))}
          </div>
        );

      case 'multiple_choice':
        if (!activeQuestion.question_data.choices) return null;
        return (
          <RadioGroup
            value={response}
            onValueChange={setResponse}
            className="space-y-2"
            disabled={isSubmitting}
          >
            {activeQuestion.question_data.choices.map((choice) => (
              <div key={choice.value} className="flex items-center space-x-2">
                <RadioGroupItem value={choice.value} id={choice.value} />
                <label
                  htmlFor={choice.value}
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    response === choice.value && "text-primary"
                  )}
                >
                  {choice.text}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Your answer"
            disabled={isSubmitting}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            Joined as: {participantInfo?.displayName}
          </div>

          {activeQuestion ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{activeQuestion.question_data.title}</h2>
              
              <div className="space-y-4">
                {renderResponseInput()}

                <Button
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Waiting for the next question...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
