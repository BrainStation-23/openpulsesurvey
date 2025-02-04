import { cn } from "@/lib/utils";

export const slideTransitionClasses = {
  base: "absolute inset-0 transition-opacity duration-500 ease-in-out",
  active: "opacity-100",
  inactive: "opacity-0 pointer-events-none",
};

export const getSlideClasses = (isActive: boolean, className?: string) => {
  return cn(
    slideTransitionClasses.base,
    "bg-gradient-to-br from-white to-gray-50",
    "rounded-lg shadow-lg p-4 md:p-6 lg:p-8",
    isActive ? slideTransitionClasses.active : slideTransitionClasses.inactive,
    className
  );
};