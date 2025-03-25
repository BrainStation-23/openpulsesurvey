
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, ClipboardList, Settings2, Trophy, Kanban, Target, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/user/dashboard",
  },
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
  {
    title: "My OKRs",
    icon: Target,
    path: "/user/okrs",
    children: [
      {
        title: "Dashboard",
        path: "/user/okrs",
      },
      {
        title: "Objectives",
        path: "/user/okrs/objectives",
      }
    ]
  },
  {
    title: "My Achievements",
    icon: Trophy,
    path: "/user/achievements",
  },
  {
    title: "Settings",
    icon: Settings2,
    path: "/user/settings",
  },
];

interface UserSidebarProps {
  onSignOut: () => void;
}

export default function UserSidebar({ onSignOut }: UserSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();
  const location = useLocation();

  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">User Portal</h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                <NavigationMenu orientation="vertical" className="w-full">
                  <NavigationMenuList className="w-full flex-col items-start">
                    <NavigationMenuItem className="w-full">
                      <NavigationMenuTrigger 
                        className={cn(
                          "w-full justify-between gap-2 bg-transparent hover:bg-accent rounded-md p-2",
                          location.pathname.startsWith(item.path) && "font-medium bg-accent/50"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-4 w-4 mr-2" />
                          <span>
                            {item.title}
                            {item.path === "/user/my-surveys" && pendingSurveysCount > 0 && ` (${pendingSurveysCount})`}
                          </span>
                        </div>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="w-full">
                        <ul className="flex flex-col gap-1 p-2 w-full">
                          {item.children.map((child) => (
                            <li key={child.path} className="w-full">
                              <NavigationMenuLink asChild>
                                <Link 
                                  to={child.path}
                                  className={cn(
                                    "block px-4 py-2 hover:bg-accent rounded-md w-full text-sm",
                                    location.pathname === child.path && "font-medium bg-accent/50"
                                  )}
                                >
                                  {child.title}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ) : (
                <SidebarMenuButton 
                  asChild
                  className={cn(
                    location.pathname === item.path && "bg-accent font-medium"
                  )}
                >
                  <Link to={item.path} className="flex items-center">
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>
                      {item.title}
                      {item.path === "/user/my-surveys" && pendingSurveysCount > 0 && ` (${pendingSurveysCount})`}
                    </span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
      <div className="p-2 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </Sidebar>
  );
}
