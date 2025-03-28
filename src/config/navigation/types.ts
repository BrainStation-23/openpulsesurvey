
import { LucideIcon } from "lucide-react";

// Navigation item with optional children for nested navigation
export type NavigationItem = {
  title: string;
  icon: LucideIcon;
  path: string;
  children?: NavigationItem[];
  section?: string;
};

// Section definition for sidebar organization
export type NavigationSection = {
  id: string;
  label: string;
};
