import {
  LayoutDashboard,
  ListChecks,
  BarChart4,
  Settings,
  HelpCircle,
  Share2,
} from "lucide-react"

import { MainNavItem } from "@/types"

interface Props {
  items?: MainNavItem[]
}

export function MainNav({ items }: Props) {
  const routes = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Campaigns",
      href: "/admin/surveys/campaigns",
      icon: ListChecks,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart4,
    },
  ]

  const surveyRoutes = [
    {
      title: "Campaigns",
      href: "/admin/surveys/campaigns",
      icon: ListChecks,
    },
    {
      title: "Shared Presentations",
      href: "/admin/surveys/shared",
      icon: Share2,
    },
  ];

  const otherRoutes = [
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Help",
      href: "/admin/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div className="hidden lg:flex flex-col space-y-6 p-6 w-80">
      <div className="flex flex-col space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">Main Navigation</h2>
        {routes.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
      <div className="flex flex-col space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">Surveys</h2>
        {surveyRoutes.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
      <div className="flex flex-col space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">Other</h2>
        {otherRoutes.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:underline"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
