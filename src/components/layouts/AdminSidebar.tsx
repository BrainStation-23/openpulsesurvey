
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { navigationItems, navigationSections } from "@/config/navigation";

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const location = useLocation();
  const { setOpen } = useSidebar();
  
  // Set sidebar open on component mount
  React.useEffect(() => {
    setOpen(true);
  }, [setOpen]);
  
  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">Admin Portal</h2>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
        {navigationSections.map((section) => (
          <div key={section.id} className="mb-4">
            <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">{section.label}</h3>
            <SidebarMenu>
              {navigationItems
                .filter((item) => item.section === section.id)
                .map((item) => {
                  if (item.children) {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          asChild
                        >
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                        <div className="mt-1 pl-6 space-y-1">
                          {item.children.map((child) => (
                            <SidebarMenuButton
                              key={child.path}
                              isActive={location.pathname === child.path}
                              asChild
                            >
                              <Link to={child.path} className="flex items-center">
                                <child.icon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      </SidebarMenuItem>
                    );
                  }

                  // Insert My Team after My Profile
                  if (item.path === "/admin/profile") {
                    return (
                      <React.Fragment key={item.path}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={location.pathname === item.path}
                            asChild
                          >
                            <Link to={item.path} className="flex items-center">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={location.pathname === "/admin/my-team"}
                            asChild
                          >
                            <Link to="/admin/my-team" className="flex items-center">
                              <Users className="h-4 w-4" />
                              <span>My Team</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </React.Fragment>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={location.pathname === item.path}
                        asChild
                      >
                        <Link to={item.path} className="flex items-center">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </div>
        ))}
      </div>

      <div className="p-2">
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

// Import Users icon to fix the missing import error 
import { Users } from "lucide-react";
