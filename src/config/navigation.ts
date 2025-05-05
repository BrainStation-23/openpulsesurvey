import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Grid,
  ClipboardList,
  Mail,
  MapPin,
  Layers,
  Briefcase,
  Shield,
  BrainCircuit,
  UserRound,
  Trophy,
  Radio,
  Kanban,
  Target,
  Building2,
  Database,
  BarChart,
  ChevronDown,
  Rocket,
  UserCircle,
  Sliders,
  BarChart3,
  PieChart,
  LineChart,
  FormInput,
  PanelTop,
  History,
  Info
} from "lucide-react";

// Navigation item with optional children for nested navigation
export type NavigationItem = {
  title: string;
  icon: any;
  path: string;
  children?: NavigationItem[];
  section?: string;
};

// Organized navigation items grouped by logical sections
export const navigationItems: NavigationItem[] = [
  {
    title: "User Center",
    icon: UserCircle,
    path: "/admin/profile",
    section: "core",
    children: [
      {
        title: "My Profile",
        icon: UserCircle,
        path: "/admin/profile",
      },
      {
        title: "My Team",
        icon: Users,
        path: "/admin/my-team",
      },
      {
        title: "My Surveys",
        icon: ClipboardList,
        path: "/admin/my-surveys",
      },
      {
        title: "Settings",
        icon: Settings,
        path: "/admin/settings",
      },
    ]
  },
  {
    title: "Surveys",
    icon: FileText,
    path: "/admin/surveys",
    section: "surveys",
    children: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
      },
      {
        title: "Survey Builder",
        icon: FormInput,
        path: "/admin/surveys",
      },
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
    title: "Issue Boards",
    icon: Kanban,
    path: "/admin/surveys/issue-boards",
    section: "issue_boards"
  },
  {
    title: "OKRs",
    icon: Target,
    path: "/admin/okrs",
    section: "okrs",
    children: [
      {
        title: "Dashboard",
        icon: BarChart,
        path: "/admin/okrs/dashboard",
      },
      {
        title: "Cycles",
        icon: Grid,
        path: "/admin/okrs/cycles",
      },
      {
        title: "Objectives",
        icon: Rocket,
        path: "/admin/okrs/objectives",
      },
      {
        title: "History",
        icon: History,
        path: "/admin/okrs/history",
      },
      {
        title: "Settings",
        icon: Sliders,
        path: "/admin/okrs/settings",
      }
    ],
  },
  {
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
      },
      {
        title: "System Info",
        icon: Info,
        path: "/admin/settings/system-info",
      }
    ],
  },
];

// Grouping data for the sidebar sections
export const navigationSections = [
  { id: "core", label: "User Account" },
  { id: "surveys", label: "Survey Management" },
  { id: "issue_boards", label: "Issue Management" },
  { id: "okrs", label: "OKR System" },
  { id: "config", label: "Configuration" },
];
