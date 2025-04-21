
import React from "react";

export function MiniMap({ totalSlides, currentSlide }: { totalSlides: number; currentSlide: number }) {
  return (
    <div className="flex gap-1 items-center px-2">
      {Array.from({ length: totalSlides }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-2 h-2 rounded-full transition-all mx-0.5 ${currentSlide === i ? "bg-primary scale-125" : "bg-gray-300"}`}
          style={{ opacity: currentSlide === i ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}
