
import { 
  LayoutDashboard, 
  Settings2, 
  UserRound, 
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
  Building2,
  Lock,
  KeyRound
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
    ],
  },
  {
    title: "Platform Config",
    icon: Settings2,
    path: "/admin/config",
    children: [
      {
        title: "Organization",
        icon: Building2,
        path: "/admin/config/organization",
        children: [
          {
            title: "SBUs",
            icon: Database,
            path: "/admin/config/sbus",
          },
          {
            title: "Location",
            icon: MapPin,
            path: "/admin/config/location",
          }
        ]
      },
      {
        title: "Employee",
        icon: Users,
        path: "/admin/config/employee",
        children: [
          {
            title: "Role",
            icon: Shield,
            path: "/admin/config/employee-role",
          },
          {
            title: "Type",
            icon: UserRound,
            path: "/admin/config/employee-type",
          },
          {
            title: "Employment Type",
            icon: Briefcase,
            path: "/admin/config/employment-type",
          },
          {
            title: "Level",
            icon: Layers,
            path: "/admin/config/level",
          }
        ]
      },
      {
        title: "System",
        icon: Settings2,
        path: "/admin/config/system",
        children: [
          {
            title: "Email",
            icon: Mail,
            path: "/admin/config/email",
          },
          {
            title: "AI Prompts",
            icon: BrainCircuit,
            path: "/admin/config/ai-prompts",
          }
        ]
      }
    ]
  },
  {
    title: "Security",
    icon: Lock,
    path: "/admin/security",
    children: [
      {
        title: "Password",
        icon: KeyRound,
        path: "/admin/security/password",
      }
    ]
  }
];

