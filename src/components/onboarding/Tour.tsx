
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Joyride, { EVENTS, ACTIONS, STATUS } from "react-joyride";
import { useTour } from "./TourContext";
import { tours } from "./tours";

export function Tour() {
  const { currentTourId, endTour, isStepOpen } = useTour();
  const location = useLocation();

  const currentTour = useMemo(() => {
    if (!currentTourId) return null;
    return tours.find((tour) => tour.id === currentTourId);
  }, [currentTourId]);

  // Check if we're on the campaign details page
  const isCampaignDetailsPage = location.pathname.includes('/admin/surveys/campaigns/') && 
    !location.pathname.endsWith('/campaigns');

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    // If an element is not found, end the tour
    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.log("Tour target not found:", data.step?.target);
      endTour();
      return;
    }

    if (finishedStatuses.includes(status)) {
      if (status === STATUS.FINISHED) {
        // Mark the tour as completed
        localStorage.setItem(`tour_completed_${currentTourId}`, "true");
      }
      endTour();
    }
  };

  useEffect(() => {
    // If we're not on the right page for the campaign details tour, end it
    if (currentTourId === 'campaign_details_guide' && !isCampaignDetailsPage) {
      console.log("Ending campaign details tour - not on correct page");
      endTour();
    }

    // Cleanup function
    return () => {
      if (currentTourId) {
        endTour();
      }
    };
  }, [currentTourId, isCampaignDetailsPage, endTour]);

  // Don't render the tour if we're not on the right page for campaign details
  if (currentTourId === 'campaign_details_guide' && !isCampaignDetailsPage) {
    return null;
  }

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
      run={isStepOpen}
      disableOverlayClose={false}
      spotlightClicks={false}
    />
  );
}
