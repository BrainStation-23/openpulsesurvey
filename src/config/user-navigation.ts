
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings2, 
  Trophy, 
  Kanban, 
  UserCircle, 
  Users,
  MessageSquare,
  LineChart
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
        title: "Settings",
        icon: Settings2,
        path: "/user/settings",
      },
    ]
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    path: "/user/feedback",
    section: "feedback",
    children: [
      {
        title: "Reportee Feedback",
        icon: MessageSquare,
        path: "/user/feedback/reportee",
      },
      {
        title: "My Feedback Trend",
        icon: LineChart,
        path: "/user/feedback/trend",
      }
    ]
  },
  {
    title: "My Surveys",
    icon: ClipboardList,
    path: "/user/my-surveys",
    section: "surveys",
  },
  {
    title: "Issue Boards",
    icon: Kanban,
    path: "/user/issue-boards",
    section: "issue_boards",
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
  { id: "feedback", label: "Feedback" },
  { id: "surveys", label: "My Surveys" },
  { id: "issue_boards", label: "Issue Boards" },
  { id: "achievements", label: "Recognition" },
];
