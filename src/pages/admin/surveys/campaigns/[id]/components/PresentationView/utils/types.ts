import { CampaignData } from "../types";

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}

export interface PresentationState {
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
}

export interface SlideWrapperProps extends SlideProps {
  children: React.ReactNode;
  className?: string;
}

export interface PresentationControls {
  onNext: () => void;
  onPrevious: () => void;
  onFullscreen: () => void;
  onBack: () => void;
}