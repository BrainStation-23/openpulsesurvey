import { useState, useEffect } from "react";
import { PresentationState } from "../utils/types";

export function usePresentationState(totalSlides: number) {
  const [state, setState] = useState<PresentationState>({
    currentSlide: 0,
    totalSlides,
    isFullscreen: false,
  });

  const nextSlide = () => {
    setState(prev => ({
      ...prev,
      currentSlide: Math.min(prev.totalSlides - 1, prev.currentSlide + 1)
    }));
  };

  const previousSlide = () => {
    setState(prev => ({
      ...prev,
      currentSlide: Math.max(0, prev.currentSlide - 1)
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        previousSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    state,
    nextSlide,
    previousSlide,
    toggleFullscreen
  };
}