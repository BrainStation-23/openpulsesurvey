
import { FileText, LayoutDashboard, FormInput, Grid, Radio } from "lucide-react";
import { NavigationItem } from "./types";

export const surveysItems: NavigationItem = {
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
};
