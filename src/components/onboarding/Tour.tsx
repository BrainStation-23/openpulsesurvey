
import { useEffect, useMemo } from "react";
import Joyride, { EVENTS, ACTIONS, STATUS } from "react-joyride";
import { useTour } from "./TourContext";
import { tours } from "./tours";

export function Tour() {
  const { currentTourId, endTour, isStepOpen } = useTour();

  const currentTour = useMemo(() => {
    if (!currentTourId) return null;
    return tours.find((tour) => tour.id === currentTourId);
  }, [currentTourId]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
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
      scrollToFirstStep
      showProgress
      showSkipButton
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
