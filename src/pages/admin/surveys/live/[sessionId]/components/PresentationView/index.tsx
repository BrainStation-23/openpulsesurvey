
import { useState, useEffect } from "react";
import { LiveSession } from "../../../types";
import { SessionInfoSlide } from "./slides/SessionInfoSlide";
import { ActiveQuestionSlide } from "./slides/ActiveQuestionSlide";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { useLiveResponses } from "./hooks/useLiveResponses";
import "./styles.css";

interface PresentationViewProps {
  session: LiveSession;
}

export function PresentationView({ session }: PresentationViewProps) {
  const {
    currentSlide,
    setCurrentSlide,
    isFullscreen,
    toggleFullscreen,
    handleBack,
    totalSlides
  } = usePresentationNavigation();

  const { responses, participants, currentActiveQuestion } = useLiveResponses(session.id);

  // Determine if there are pending or active/completed questions
  const hasPendingQuestions = Boolean(responses?.some(r => r.status === "pending"));
  const hasActiveOrCompletedQuestions = Boolean(responses?.some(r => ["active", "completed"].includes(r.status)));

  const handleEnableNext = async () => {
    // Placeholder for enable next functionality
    console.log("Enable next question");
  };

  const handleResetAll = async () => {
    // Placeholder for reset all functionality
    console.log("Reset all questions");
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
