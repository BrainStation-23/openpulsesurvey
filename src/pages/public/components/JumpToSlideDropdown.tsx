
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export function JumpToSlideDropdown({
  totalSlides,
  currentSlide,
  onJump,
  slideTitles
}: {
  totalSlides: number;
  currentSlide: number;
  onJump: (idx: number) => void;
  slideTitles: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={String(currentSlide)} onValueChange={val => onJump(Number(val))}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="Go to slide..." />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <SelectItem key={idx} value={String(idx)}>
              #{idx + 1} – {slideTitles[idx] || "Untitled"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
