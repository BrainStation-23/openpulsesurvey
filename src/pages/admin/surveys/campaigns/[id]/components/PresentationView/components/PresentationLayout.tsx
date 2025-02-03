import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface PresentationLayoutProps extends PropsWithChildren {
  progress: number;
  className?: string;
}

export function PresentationLayout({ children, progress, className }: PresentationLayoutProps) {
  return (
    <div className={cn("h-full bg-background relative", className)}>
      <div className="relative h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="h-full p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}