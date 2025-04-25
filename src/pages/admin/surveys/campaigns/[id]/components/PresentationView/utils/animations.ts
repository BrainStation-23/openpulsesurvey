
export function getSlideClasses(isActive: boolean, className?: string): string {
  const baseClasses = "absolute inset-0 transition-all duration-500 ease-in-out";
  const visibilityClasses = isActive ? "opacity-100" : "opacity-0 pointer-events-none";
  
  return `${baseClasses} ${visibilityClasses} ${className || ""}`.trim();
}
