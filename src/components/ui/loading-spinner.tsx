
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function LoadingSpinner({ 
  className, 
  size = 24, 
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn("flex items-center justify-center", className)} 
      {...props}
    >
      <Loader 
        size={size}
        className="animate-spin text-muted-foreground" 
      />
    </div>
  );
}
