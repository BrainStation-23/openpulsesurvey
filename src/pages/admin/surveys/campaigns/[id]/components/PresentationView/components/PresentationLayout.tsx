
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface PresentationLayoutProps extends PropsWithChildren {
  progress: number;
  className?: string;
  isFullscreen: boolean;
}

export function PresentationLayout({ children, progress, isFullscreen, className }: PresentationLayoutProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const controls = childrenArray[0];
  const content = childrenArray.slice(1);

  return (
    <div className={cn(
      "relative h-full w-full bg-background transition-colors duration-300",
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

      {/* Controls container */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 bg-gradient-to-b from-black/20 to-transparent z-[55]",
        isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <div className="flex-1">
          {controls}
        </div>
      </div>

      {/* Main content */}
      <div className="h-full overflow-hidden pt-4">
        <div className="h-full p-8">
          <div className="relative max-w-full mx-auto h-full">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
