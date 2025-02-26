
import { LiveSession } from "../../../types";
import { SessionInfoSlide } from "./slides/SessionInfoSlide";
import { QuestionSlide } from "./slides/QuestionSlide";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { useLiveResponses } from "./hooks/useLiveResponses";
import { useEffect } from "react";
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
    totalSlides,
    setTotalSlides
  } = usePresentationNavigation();

  const { getQuestionResponses, participants, activeQuestions } = useLiveResponses(session.id);

  // Update total slides when questions change
  useEffect(() => {
    setTotalSlides(activeQuestions.length + 1); // +1 for the info slide
  }, [activeQuestions.length, setTotalSlides]);

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
        isFirstSlide={currentSlide === 0}
        isLastSlide={currentSlide === totalSlides - 1}
        isFullscreen={isFullscreen}
        currentSlide={currentSlide + 1}
        totalSlides={totalSlides}
      />
      
      <SessionInfoSlide 
        session={session}
        participants={participants}
        isActive={currentSlide === 0}
      />
      
      {activeQuestions.map((question, index) => (
        <QuestionSlide
          key={question.id}
          currentActiveQuestion={question}
          responses={getQuestionResponses(question.question_key)}
          isActive={currentSlide === index + 1}
          isSessionActive={session.status === "active"}
        />
      ))}
    </PresentationLayout>
  );
}
