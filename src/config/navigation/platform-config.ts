
import { 
  Settings, 
  Users, 
  Building2, 
  Mail, 
  MapPin, 
  Layers, 
  Briefcase, 
  UserRound, 
  Shield, 
  BrainCircuit, 
  Trophy 
} from "lucide-react";
import { NavigationItem } from "./types";

export const platformConfigItems: NavigationItem = {
  title: "Platform Config",
  icon: Settings,
  path: "/admin/config",
  section: "config",
  children: [
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "SBUs",
      icon: Building2,
      path: "/admin/config/sbus",
    },
    {
      title: "Email",
      icon: Mail,
      path: "/admin/config/email",
    },
    {
      title: "Location",
      icon: MapPin,
      path: "/admin/config/location",
    },
    {
      title: "Level",
      icon: Layers,
      path: "/admin/config/level",
    },
    {
      title: "Employment Type",
      icon: Briefcase,
      path: "/admin/config/employment-type",
    },
    {
      title: "Employee Type",
      icon: UserRound,
      path: "/admin/config/employee-type",
    },
    {
      title: "Employee Role",
      icon: Shield,
      path: "/admin/config/employee-role",
    },
    {
      title: "AI Prompts",
      icon: BrainCircuit,
      path: "/admin/config/ai-prompts",
    },
    {
      title: "Achievements",
      icon: Trophy,
      path: "/admin/achievements",
    }
  ],
};
