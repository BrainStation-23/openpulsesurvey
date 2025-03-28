
import React from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullScreenToggleProps {
  isFullScreen: boolean;
  onToggle: () => void;
}

export const FullScreenToggle: React.FC<FullScreenToggleProps> = ({ 
  isFullScreen, 
  onToggle 
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-10 bg-white"
      onClick={onToggle}
    >
      {isFullScreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  );
};
