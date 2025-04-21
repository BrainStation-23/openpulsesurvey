
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface PresentationLayoutProps extends PropsWithChildren {
  progress: number;
  className?: string;
  isFullscreen: boolean;
}

export function PresentationLayout({ children, progress, isFullscreen, className }: PresentationLayoutProps) {
  return (
    <div className={cn(
      "relative w-full h-full bg-background transition-colors duration-300 rounded-lg overflow-hidden shadow-lg",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-[60]">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="w-full h-full p-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
