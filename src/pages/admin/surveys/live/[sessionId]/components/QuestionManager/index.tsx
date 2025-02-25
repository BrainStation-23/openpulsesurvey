import { useEffect, useState } from "react";
import { LiveSession, LiveSessionQuestion, QuestionStatus, QuestionData } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { QuestionCard } from "./QuestionCard";
import { QuestionControls } from "./QuestionControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface QuestionManagerProps {
  session: LiveSession;
}

export function QuestionManager({ session }: QuestionManagerProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<LiveSessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "completed">("all");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeQuestion = questions.find(q => q.id === active.id);
    const overQuestion = questions.find(q => q.id === over.id);
    
    if (!activeQuestion || !overQuestion) return;

    // Get old and new positions
    const oldOrder = activeQuestion.display_order;
    const newOrder = overQuestion.display_order;

    try {
      // Start a batch operation
      if (oldOrder < newOrder) {
        // Moving down: update all questions between old and new position
        const { error } = await supabase.rpc('reorder_questions', {
          p_session_id: session.id,
          p_question_id: activeQuestion.id,
          p_old_order: oldOrder,
          p_new_order: newOrder,
          p_direction: 'down'
        });
        
        if (error) throw error;
      } else {
        // Moving up: update all questions between new and old position
        const { error } = await supabase.rpc('reorder_questions', {
          p_session_id: session.id,
          p_question_id: activeQuestion.id,
          p_old_order: oldOrder,
          p_new_order: newOrder,
          p_direction: 'up'
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error during drag and drop:", error);
      toast({
        title: "Error",
        description: "Failed to reorder questions",
        variant: "destructive",
      });
    }
  };

  const transformQuestion = (rawQuestion: any): LiveSessionQuestion => {
    const questionData: QuestionData = {
      title: rawQuestion.question_data.title || "Untitled Question",
      type: rawQuestion.question_data.type || "unknown",
      ...rawQuestion.question_data
    };

    return {
      ...rawQuestion,
      question_data: questionData,
      status: rawQuestion.status as QuestionStatus
    };
  };

  const getQuestionCounts = () => {
    return {
      all: questions.length,
      pending: questions.filter(q => q.status === "pending").length,
      active: questions.filter(q => q.status === "active").length,
      completed: questions.filter(q => q.status === "completed").length,
    };
  };

  const handleEnableNext = async () => {
    const nextPendingQuestion = questions
      .filter(q => q.status === "pending")
      .sort((a, b) => a.display_order - b.display_order)[0];

    if (!nextPendingQuestion) return;

    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({
          status: "active",
          enabled_at: new Date().toISOString()
        })
        .eq("id", nextPendingQuestion.id);

      if (error) throw error;

      toast({
        title: "Question enabled",
        description: `Question "${nextPendingQuestion.question_data.title}" is now active`,
      });
    } catch (error) {
      console.error("Error enabling question:", error);
      toast({
        title: "Error",
        description: "Failed to enable question",
        variant: "destructive",
      });
    }
  };

  const handleResetAll = async () => {
    const activeOrCompletedQuestions = questions.filter(
      q => q.status === "active" || q.status === "completed"
    );

    if (activeOrCompletedQuestions.length === 0) return;

    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({
          status: "pending",
          enabled_at: null,
          disabled_at: null
        })
        .in("id", activeOrCompletedQuestions.map(q => q.id));

      if (error) throw error;

      toast({
        title: "Questions reset",
        description: "All questions have been reset to pending status",
      });
    } catch (error) {
      console.error("Error resetting questions:", error);
      toast({
        title: "Error",
        description: "Failed to reset questions",
        variant: "destructive",
      });
    }
  };

  const onReorder = async (questionId: string, newOrder: number) => {
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
        onEnableNext={handleEnableNext}
        onResetAll={handleResetAll}
      />
      
      <ScrollArea className="h-[500px] p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground">No questions found</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredQuestions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onStatusChange={async (status: QuestionStatus) => {
                      try {
                        const { error } = await supabase
                          .from("live_session_questions")
                          .update({
                            status,
                            enabled_at: status === "active" ? new Date().toISOString() : null,
                            disabled_at: status === "completed" ? new Date().toISOString() : null
                          })
                          .eq("id", question.id);

                        if (error) throw error;
                      } catch (error) {
                        console.error("Error updating question status:", error);
                        toast({
                          title: "Error",
                          description: "Failed to update question status",
                          variant: "destructive",
                        });
                      }
                    }}
                    onReorder={async (questionId: string, newOrder: number) => {
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
                    }}
                    sessionStatus={session.status}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
