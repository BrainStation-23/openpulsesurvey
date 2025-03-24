
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { navigationItems, navigationSections } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    surveys: true,
    okrs: true,
    config: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Check if an item is currently active
  const isItemActive = (path: string) => {
    if (path === "/admin/dashboard" && location.pathname === "/admin") {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">Admin Portal</h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        {/* Render navigation items grouped by sections */}
        {navigationSections.map((section) => {
          const sectionItems = navigationItems.filter(item => item.section === section.id);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={section.id} className="py-1">
              {!isCollapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </h3>
                </div>
              )}
              <SidebarMenu>
                {sectionItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      // Item with children - render as collapsible section
                      <Collapsible
                        open={expandedSections[section.id]}
                        onOpenChange={() => toggleSection(section.id)}
                        className="w-full"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "justify-between w-full",
                              isItemActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )}
                          >
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4 mr-2" />
                              <span>{item.title}</span>
                            </div>
                            {expandedSections[section.id] ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 ml-4 border-l pl-2 border-muted">
                            <SidebarMenu>
                              {item.children.map((child) => (
                                <SidebarMenuItem key={child.title}>
                                  <SidebarMenuButton
                                    asChild
                                    isActive={isItemActive(child.path)}
                                    tooltip={child.title}
                                  >
                                    <Link to={child.path} className="flex items-center">
                                      <child.icon className="h-4 w-4 mr-2" />
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Regular item - render as link
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive(item.path)}
                        tooltip={item.title}
                      >
                        <Link to={item.path} className="flex items-center">
                          <item.icon className="h-4 w-4 mr-2" />
                          <span>
                            {item.title}
                            {item.path === "/admin/my-surveys" && pendingSurveysCount > 0 && (
                              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
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
              {!isCollapsed && <Separator className="my-2 opacity-50" />}
            </div>
          );
        })}
      </div>
      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </Sidebar>
  );
}
