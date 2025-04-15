
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | number;
  percentage?: number;
}

export function LoadingSpinner({ className, size = "md", percentage }: LoadingSpinnerProps) {
  // If size is a string, use the sizeClass mapping
  // If size is a number, create a dynamic size class
  let sizeClassName: string;
  
  if (typeof size === "string") {
    const sizeClass = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };
    sizeClassName = sizeClass[size];
  } else {
    // Handle numeric sizes by creating a dynamic class
    sizeClassName = `h-[${size}px] w-[${size}px]`;
  }

  return (
    <div className="relative">
      <Loader2 
        className={cn("animate-spin text-primary", sizeClassName, className)} 
      />
      {percentage !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
