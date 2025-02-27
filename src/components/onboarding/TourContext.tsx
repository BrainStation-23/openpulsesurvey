
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TourContextType } from "./types";

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);
  const [isStepOpen, setIsStepOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startTour = useCallback((tourId: string) => {
    setCurrentTourId(tourId);
    setCurrentStepIndex(0);
    setIsStepOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setCurrentTourId(null);
    setIsStepOpen(false);
    setCurrentStepIndex(0);
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
  }, []);

  const getTourCompletion = useCallback((tourId: string) => {
    return localStorage.getItem(`tour_completed_${tourId}`) === "true";
  }, []);

  const value = {
    currentTourId,
    currentStepIndex,
    startTour,
    endTour,
    goToStep,
    isTourActive: !!currentTourId,
    isStepOpen,
    getTourCompletion,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
