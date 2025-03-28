
import { Target, BarChart, Grid, FileText, Rocket, Sliders } from "lucide-react";
import { NavigationItem } from "./types";

export const okrsItems: NavigationItem = {
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
      title: "Templates",
      icon: FileText,
      path: "/admin/okrs/templates",
    },
    {
      title: "Objectives",
      icon: Rocket,
      path: "/admin/okrs/objectives",
    },
    {
      title: "Settings",
      icon: Sliders,
      path: "/admin/okrs/settings",
    }
  ],
};
