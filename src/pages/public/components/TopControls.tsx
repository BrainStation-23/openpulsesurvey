
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronsRight, Maximize, Minimize, Export, FileText } from "lucide-react";
import React from "react";
import { MiniMap } from "./MiniMap";

interface TopControlsProps {
  onBack: () => void;
  onOverview: () => void;
  onExport: () => void;
  onNotes: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  showOverview: boolean;
  showNotes: boolean;
  currentSlide: number;
  totalSlides: number;
}

export function TopControls({
  onBack,
  onOverview,
  onExport,
  onNotes,
  onFullscreen,
  isFullscreen,
  showOverview,
  showNotes,
  currentSlide,
  totalSlides,
}: TopControlsProps) {
  return (
    <div className="sticky z-30 flex items-center gap-2 top-0 px-4 pt-3 pb-2 bg-white/80 rounded shadow-sm mx-auto mt-2 w-fit">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-black hover:bg-black/20 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOverview}
        className={showOverview ? "text-primary" : "text-black"}
        aria-label="Slides overview"
        title="Toggle Slide Overview (O)"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExport}
        className="text-black"
        aria-label="Export"
        title="Export to PPTX"
      >
        <Export className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNotes}
        className={showNotes ? "text-primary" : "text-black"}
        aria-label="Notes"
        title="Toggle Notes Panel (N)"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost"
        size="icon"
        onClick={onFullscreen}
        className="text-black"
        aria-label="Fullscreen"
        title="Toggle Fullscreen (F)"
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
      <MiniMap totalSlides={totalSlides} currentSlide={currentSlide} />
    </div>
  );
}
