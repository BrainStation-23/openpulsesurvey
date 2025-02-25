
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function usePresentationNavigation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalSlides, setTotalSlides] = useState(1); // Add state for totalSlides
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Move handleKeyDown logic to useCallback to access latest totalSlides
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowRight") {
      setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
    } else if (e.key === "f") {
      toggleFullscreen();
    }
  }, [totalSlides]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
      toast({
        title: "Fullscreen Error",
        description: "Unable to toggle fullscreen mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    }
    navigate(-1);
  };

  return {
    currentSlide,
    setCurrentSlide,
    isFullscreen,
    toggleFullscreen,
    handleBack,
    totalSlides,
    setTotalSlides // Export setTotalSlides so PresentationView can update it
  };
}
