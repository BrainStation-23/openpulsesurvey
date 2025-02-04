import { SlideWrapperProps } from "../utils/types";
import { getSlideClasses } from "../utils/animations";

export function SlideWrapper({ 
  children, 
  isActive, 
  className 
}: SlideWrapperProps) {
  return (
    <div className={getSlideClasses(isActive, className)}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}