
import { ReactNode } from 'react';

interface PresentationLayoutProps {
  children: ReactNode;
  progress: number;
  isFullscreen?: boolean;
}

export function PresentationLayout({ children, progress, isFullscreen }: PresentationLayoutProps) {
  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Progress bar at the top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Presentation content */}
      <div className={`flex-1 relative ${isFullscreen ? 'bg-white' : 'bg-white rounded-lg shadow'}`}>
        {children}
      </div>
    </div>
  );
}
