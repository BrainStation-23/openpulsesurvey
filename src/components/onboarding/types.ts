
export type TourStep = {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  disableBeacon?: boolean;
  showSkipButton?: boolean;
  showProgress?: boolean;
};

export type TourConfig = {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
  completionKey: string;
  prerequisiteTours?: string[];
};

export type TourContextType = {
  currentTourId: string | null;
  startTour: (tourId: string) => void;
  endTour: () => void;
  isTourActive: boolean;
  isStepOpen: boolean;
  getTourCompletion: (tourId: string) => boolean;
};
