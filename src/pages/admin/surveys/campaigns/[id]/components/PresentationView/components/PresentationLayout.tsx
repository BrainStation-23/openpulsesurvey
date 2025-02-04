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
      "relative h-full bg-background transition-colors duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-background",
      className
    )}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-30">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="relative h-full overflow-hidden">
        <div className="h-full p-8">
          <div className="relative max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}