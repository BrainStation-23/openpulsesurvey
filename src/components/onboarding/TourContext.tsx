
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TourContextType } from "./types";

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);
  const [isStepOpen, setIsStepOpen] = useState(false);

  const startTour = useCallback((tourId: string) => {
    setCurrentTourId(tourId);
    setIsStepOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setCurrentTourId(null);
    setIsStepOpen(false);
  }, []);

  const getTourCompletion = useCallback((tourId: string) => {
    return localStorage.getItem(`tour_completed_${tourId}`) === "true";
  }, []);

  const value = {
    currentTourId,
    startTour,
    endTour,
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
