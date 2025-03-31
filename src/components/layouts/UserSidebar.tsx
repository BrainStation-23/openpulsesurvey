
import { Link, useLocation } from "react-router-dom";
import { LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import { userNavigationItems, userNavigationSections } from "@/config/user-navigation";

interface UserSidebarProps {
  onSignOut: () => void;
}

export default function UserSidebar({ onSignOut }: UserSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if a path is active, including child paths
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if a section has any active item
  const isSectionActive = (items: typeof userNavigationItems) => {
    return items.some(item => isActive(item.path));
  };

  // Group navigation items by section
  const groupedItems = userNavigationSections.map(section => {
    const sectionItems = userNavigationItems.filter(item => item.section === section.id);
    return {
      ...section,
      items: sectionItems,
    };
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-3">
        <h2 className="font-semibold">User Portal</h2>
      </SidebarHeader>
      <SidebarContent>
        {groupedItems.map(section => (
          section.items.length > 0 && (
            <SidebarGroup key={section.id}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => (
                    <SidebarMenuItem key={item.title}>
                      {item.children ? (
                        <div className="flex flex-col w-full">
                          <button
                            onClick={() => toggleSection(item.title)}
                            className={cn(
                              "flex items-center justify-between w-full p-2 rounded-md",
                              isSectionActive(item.children) && "bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              {item.path === "/user/my-surveys" && pendingSurveysCount > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                  {pendingSurveysCount}
                                </span>
                              )}
                            </div>
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              expanded[item.title] && "transform rotate-180"
                            )} />
                          </button>
                          {expanded[item.title] && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children.map(child => (
                                <SidebarMenuButton key={child.path} asChild
                                  isActive={isActive(child.path)}
                                >
                                  <Link to={child.path} className="flex items-center gap-2 py-1">
                                    <child.icon className="h-4 w-4" />
                                    <span>
                                      {child.title}
                                      {child.path === "/user/my-surveys" && pendingSurveysCount > 0 && (
                                        <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                          {pendingSurveysCount}
                                        </span>
                                      )}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <SidebarMenuButton asChild isActive={isActive(item.path)}>
                          <Link to={item.path} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>
                              {item.title}
                              {item.title === "My Surveys" && pendingSurveysCount > 0 && (
                                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                  {pendingSurveysCount}
                                </span>
                              )}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
