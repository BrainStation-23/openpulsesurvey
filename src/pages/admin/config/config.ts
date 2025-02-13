
import {
  Building2,
  Users,
  Mail,
  MapPin,
  Layers,
  Briefcase,
  UserRound,
  Shield,
  BrainCircuit,
  Settings,
} from "lucide-react";

interface ConfigItem {
  title: string;
  path: string;
  icon: any;
  description: string;
}

interface ConfigCategory {
  title: string;
  items: ConfigItem[];
}

export const navigationConfig: ConfigCategory[] = [
  {
    title: "Organization Structure",
    items: [
      {
        title: "SBUs",
        path: "/admin/config/sbus",
        icon: Building2,
        description: "Manage Strategic Business Units",
      },
      {
        title: "Location",
        path: "/admin/config/location",
        icon: MapPin,
        description: "Configure office locations",
      },
    ],
  },
  {
    title: "Employee Settings",
    items: [
      {
        title: "Employee Type",
        path: "/admin/config/employee-type",
        icon: Users,
        description: "Manage employee classifications",
      },
      {
        title: "Employee Role",
        path: "/admin/config/employee-role",
        icon: Shield,
        description: "Configure employee roles and permissions",
      },
      {
        title: "Employment Type",
        path: "/admin/config/employment-type",
        icon: Briefcase,
        description: "Set up employment categories",
      },
      {
        title: "Level",
        path: "/admin/config/level",
        icon: Layers,
        description: "Configure employee levels",
      },
    ],
  },
  {
    title: "System Settings",
    items: [
      {
        title: "Email",
        path: "/admin/config/email",
        icon: Mail,
        description: "Configure email settings",
      },
      {
        title: "AI Prompts",
        path: "/admin/config/ai-prompts",
        icon: BrainCircuit,
        description: "Manage AI analysis prompts",
      },
    ],
  },
];
