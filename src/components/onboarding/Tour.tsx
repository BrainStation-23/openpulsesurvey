
import { useEffect, useMemo } from "react";
import Joyride, { EVENTS, ACTIONS, STATUS, CallBackProps, Status } from "react-joyride";
import { useTour } from "./TourContext";
import { tours } from "./tours";

export function Tour() {
  const { currentTourId, currentStepIndex, endTour, goToStep, isStepOpen } = useTour();

  const currentTour = useMemo(() => {
    if (!currentTourId) return null;
    return tours.find((tour) => tour.id === currentTourId);
  }, [currentTourId]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        goToStep(index + 1);
      } else if (action === ACTIONS.PREV) {
        goToStep(index - 1);
      }
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      // Skip to the next step if target is not found
      goToStep(index + 1);
    }

    // Properly check the status using the STATUS enum
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (status === STATUS.FINISHED) {
        // Mark the tour as completed
        localStorage.setItem(`tour_completed_${currentTourId}`, "true");
      }
      endTour();
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (currentTourId) {
        endTour();
      }
    };
  }, [currentTourId, endTour]);

  if (!currentTour || !isStepOpen) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={isStepOpen}
      scrollToFirstStep
      showProgress
      showSkipButton
      stepIndex={currentStepIndex}
      steps={currentTour.steps}
      styles={{
        options: {
          primaryColor: "rgb(59 130 246)",
          zIndex: 1000,
        },
      }}
    />
  );
}
