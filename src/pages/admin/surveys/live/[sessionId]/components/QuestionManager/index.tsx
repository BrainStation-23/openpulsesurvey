
import { useEffect, useState } from "react";
import { LiveSession, LiveSessionQuestion, QuestionData, QuestionStatus } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { QuestionCard } from "./QuestionCard";
import { QuestionControls } from "./QuestionControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Json } from "@/integrations/supabase/types";

interface QuestionManagerProps {
  session: LiveSession;
}

export function QuestionManager({ session }: QuestionManagerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<LiveSessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "completed">("all");

  // Helper function to transform database question to LiveSessionQuestion
  const transformQuestion = (dbQuestion: any): LiveSessionQuestion => {
    const rawData = dbQuestion.question_data as Json;
    const questionData = typeof rawData === 'object' ? rawData as QuestionData : {
      title: "Untitled Question",
      type: "unknown"
    };
    
    return {
      ...dbQuestion,
      question_data: {
        title: questionData.title || "Untitled Question",
        type: questionData.type || "unknown",
        ...questionData
      },
      status: dbQuestion.status as QuestionStatus
    };
  };

  // Calculate question counts
  const getQuestionCounts = () => {
    return {
      all: questions.length,
      pending: questions.filter(q => q.status === "pending").length,
      active: questions.filter(q => q.status === "active").length,
      completed: questions.filter(q => q.status === "completed").length,
    };
  };

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("live_session_questions")
          .select("*")
          .eq("session_id", session.id)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setQuestions(data ? data.map(transformQuestion) : []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    // Set up real-time subscription
    const channel = supabase
      .channel(`questions:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_questions",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setQuestions((prev) => [...prev, transformQuestion(payload.new)]);
          } else if (payload.eventType === "UPDATE") {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === payload.new.id ? transformQuestion(payload.new) : q
              )
            );
          } else if (payload.eventType === "DELETE") {
            setQuestions((prev) => prev.filter((q) => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id, toast]);

  const updateQuestionStatus = async (questionId: string, status: QuestionStatus) => {
    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({
          status,
          enabled_at: status === "active" ? new Date().toISOString() : undefined,
          disabled_at: status === "completed" ? new Date().toISOString() : undefined,
        })
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Question updated",
        description: `Question status changed to ${status}`,
      });
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question status",
        variant: "destructive",
      });
    }
  };

  const reorderQuestions = async (questionId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({ display_order: newOrder })
        .eq("id", questionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error reordering questions:", error);
      toast({
        title: "Error",
        description: "Failed to reorder questions",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter(
    (q) => statusFilter === "all" || q.status === statusFilter
  );

  return (
    <div className="border rounded-lg">
      <QuestionControls
        onFilterChange={setStatusFilter}
        currentFilter={statusFilter}
        sessionStatus={session.status}
        questionCounts={getQuestionCounts()}
      />
      
      <ScrollArea className="h-[500px] p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground">No questions found</div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onStatusChange={updateQuestionStatus}
                onReorder={reorderQuestions}
                sessionStatus={session.status}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
