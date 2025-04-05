
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings2, 
  Trophy, 
  Kanban, 
  Target, 
  UserCircle, 
  Users,
  Rocket,
  BarChart,
  History
} from "lucide-react";

// Navigation item with optional children for nested navigation
export type UserNavigationItem = {
  title: string;
  icon: any;
  path: string;
  children?: UserNavigationItem[];
  section?: string;
};

// Organized navigation items grouped by logical sections
export const userNavigationItems: UserNavigationItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/user/dashboard",
    section: "core",
  },
  {
    title: "User Center",
    icon: UserCircle,
    path: "/user/profile",
    section: "user",
    children: [
      {
        title: "My Profile",
        icon: UserCircle,
        path: "/user/profile",
      },
      {
        title: "My Team",
        icon: Users,
        path: "/user/my-team",
      },
      {
        title: "Activity Log",
        icon: History,
        path: "/user/activity-log",
      },
      {
        title: "Settings",
        icon: Settings2,
        path: "/user/settings",
      },
    ]
  },
  {
    title: "Surveys",
    icon: ClipboardList,
    path: "/user/my-surveys",
    section: "surveys",
    children: [
      {
        title: "My Surveys",
        icon: ClipboardList,
        path: "/user/my-surveys",
      },
      {
        title: "Issue Boards",
        icon: Kanban,
        path: "/user/issue-boards",
      },
    ]
  },
  {
    title: "OKRs",
    icon: Target,
    path: "/user/okrs",
    section: "okrs",
    children: [
      {
        title: "Dashboard",
        icon: BarChart,
        path: "/user/okrs/dashboard",
      },
      {
        title: "Objectives",
        icon: Rocket,
        path: "/user/okrs/objectives",
      },
    ],
  },
  {
    title: "Achievements",
    icon: Trophy,
    path: "/user/achievements",
    section: "achievements",
  },
];

// Grouping data for the sidebar sections
export const userNavigationSections = [
  { id: "core", label: "Main" },
  { id: "user", label: "User Center" },
  { id: "surveys", label: "Survey Management" },
  { id: "okrs", label: "OKR System" },
  { id: "achievements", label: "Recognition" },
];
