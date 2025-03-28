
import { UserCircle, Users, ClipboardList, Settings } from "lucide-react";
import { NavigationItem } from "./types";

export const userCenterItems: NavigationItem = {
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
};
