
import React from "react";
import { cn } from "@/lib/utils";

interface SlideOverviewPanelProps {
  totalSlides: number;
  currentSlide: number;
  onJump: (slide: number) => void;
  slideTitles: string[];
  visible: boolean;
  onClose: () => void;
}

export function SlideOverviewPanel({ totalSlides, currentSlide, onJump, slideTitles, visible, onClose }: SlideOverviewPanelProps) {
  if (!visible) return null;

  return (
    <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-background/95 shadow-2xl overflow-y-auto animate-slide-in-right transition-transform">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-semibold">Slides Overview</span>
        <button className="text-xs opacity-60 hover:opacity-100" onClick={onClose}>Close</button>
      </div>
      <ul className="p-0 m-0 flex flex-col gap-0.5">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <li key={idx}>
            <button
              className={cn(
                "block w-full text-left px-4 py-2 hover:bg-blue-100 rounded transition-all",
                currentSlide === idx && "bg-primary/10 border-l-4 border-primary font-bold"
              )}
              onClick={() => onJump(idx)}
            >
              <span className="pr-2">#{idx + 1}</span>
              <span>{slideTitles[idx] || "Untitled"}</span>
              <span className="pl-2 text-xs opacity-50">{currentSlide === idx ? "(Current)" : ""}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
