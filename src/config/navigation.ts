
import { 
  LayoutDashboard, 
  Settings2, 
  Users, 
  FileText, 
  Grid,
  ClipboardList,
  Database,
  Mail,
  MapPin,
  Layers,
  Briefcase,
  Shield,
  BrainCircuit,
  UserRound,
  Trophy,
  Radio
} from "lucide-react";

export type NavigationItem = {
  title: string;
  icon: any;
  path: string;
  children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    title: "My Surveys",
    icon: ClipboardList,
    path: "/admin/my-surveys",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Surveys",
    icon: FileText,
    path: "/admin/surveys",
    children: [
      {
        title: "Campaigns",
        icon: Grid,
        path: "/admin/surveys/campaigns",
      },
      {
        title: "Live Survey",
        icon: Radio,
        path: "/admin/surveys/live",
      },
    ],
  },
  {
    title: "Achievements",
    icon: Trophy,
    path: "/admin/achievements",
  },
  {
    title: "Platform Config",
    icon: Settings2,
    path: "/admin/config",
    children: [
      {
        title: "SBUs",
        icon: Database,
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
    ],
  },
  {
    title: "Settings",
    icon: Settings2,
    path: "/admin/settings",
  },
];
