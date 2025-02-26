
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PropsWithChildren } from "react";

interface PresentationLayoutProps extends PropsWithChildren {
  progress: number;
  className?: string;
  isFullscreen: boolean;
}

export function PresentationLayout({ children, progress, isFullscreen, className }: PresentationLayoutProps) {
  // Convert children to array to safely access elements
  const childrenArray = Array.isArray(children) ? children : [children];
  const controls = childrenArray[0];
  const content = childrenArray.slice(1);

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-background transition-colors duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-background",
      className
    )}>
      {/* Progress bar - fixed height */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-[60]">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls container - fixed height */}
      <div className={cn(
        "sticky top-0 z-[55] p-4 flex justify-between items-center transition-opacity duration-300 bg-gradient-to-b from-black/20 to-transparent",
        isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <div className="flex-1">
          {controls}
        </div>
      </div>

      {/* Main content - scrollable */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-8">
          <div className="relative max-w-full mx-auto">
            {content}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
