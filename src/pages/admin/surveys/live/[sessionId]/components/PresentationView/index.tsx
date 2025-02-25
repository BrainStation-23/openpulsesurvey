
import { useState, useEffect } from "react";
import { LiveSession } from "../../../types";
import { SessionInfoSlide } from "./slides/SessionInfoSlide";
import { ActiveQuestionSlide } from "./slides/ActiveQuestionSlide";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { useLiveResponses } from "./hooks/useLiveResponses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import "./styles.css";

interface PresentationViewProps {
  session: LiveSession;
}

export function PresentationView({ session }: PresentationViewProps) {
  const { toast } = useToast();
  const {
    currentSlide,
    setCurrentSlide,
    isFullscreen,
    toggleFullscreen,
    handleBack,
    totalSlides
  } = usePresentationNavigation();

  const { responses, participants, activeQuestions, currentActiveQuestion } = useLiveResponses(session.id);

  // Determine if there are pending or active/completed questions
  const hasPendingQuestions = activeQuestions.some(q => q.status === "pending");
  const hasActiveOrCompletedQuestions = activeQuestions.some(q => ["active", "completed"].includes(q.status));

  const handleEnableNext = async () => {
    const nextPendingQuestion = activeQuestions
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
    const questionsToReset = activeQuestions.filter(
      q => q.status === "active" || q.status === "completed"
    );

    if (questionsToReset.length === 0) return;

    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({
          status: "pending",
          enabled_at: null,
          disabled_at: null
        })
        .in("id", questionsToReset.map(q => q.id));

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

  return (
    <PresentationLayout 
      progress={((currentSlide + 1) / totalSlides) * 100}
      isFullscreen={isFullscreen}
    >
      <PresentationControls
        onBack={handleBack}
        onPrevious={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
        onFullscreen={toggleFullscreen}
        onEnableNext={handleEnableNext}
        onResetAll={handleResetAll}
        isFirstSlide={currentSlide === 0}
        isLastSlide={currentSlide === totalSlides - 1}
        isFullscreen={isFullscreen}
        currentSlide={currentSlide + 1}
        totalSlides={totalSlides}
        isSessionActive={session.status === "active"}
        hasPendingQuestions={hasPendingQuestions}
        hasActiveOrCompletedQuestions={hasActiveOrCompletedQuestions}
      />
      
      <SessionInfoSlide 
        session={session}
        participants={participants}
        isActive={currentSlide === 0}
      />
      
      <ActiveQuestionSlide
        currentActiveQuestion={currentActiveQuestion}
        responses={responses}
        isActive={currentSlide === 1}
      />
    </PresentationLayout>
  );
}
