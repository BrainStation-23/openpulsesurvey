
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Grid,
  ClipboardList,
  Mail,
  MapPin,
  Layers,
  Briefcase,
  Shield,
  BrainCircuit,
  UserRound,
  Trophy,
  Radio,
  Kanban,
  Target,
  Building2,
  Database,
  BarChart,
  Rocket,
  UserCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuTrigger, 
  SidebarMenuContent,
  SidebarMenuButton,
  SidebarSection
} from "@/components/ui/sidebar";
import { navigationItems, navigationSections } from "@/config/navigation";

// Add "My Team" to the navigation items in the function
export default function AdminSidebar({ onSignOut }) {
  const location = useLocation();
  
  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">Admin Portal</h2>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
        {navigationSections.map((section) => (
          <SidebarSection key={section.id} title={section.label}>
            <SidebarMenu>
              {navigationItems
                .filter((item) => item.section === section.id)
                .map((item) => {
                  if (item.children) {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuTrigger
                          active={isActive}
                          icon={<item.icon className="h-4 w-4" />}
                        >
                          {item.title}
                        </SidebarMenuTrigger>
                        <SidebarMenuContent>
                          {item.children.map((child) => (
                            <SidebarMenuButton
                              key={child.path}
                              active={location.pathname === child.path}
                              asChild
                            >
                              <Link to={child.path} className="flex items-center">
                                <child.icon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </SidebarMenuContent>
                      </SidebarMenuItem>
                    );
                  }

                  // Insert My Team after My Profile
                  if (item.path === "/admin/profile") {
                    return (
                      <React.Fragment key={item.path}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            active={location.pathname === item.path}
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
                            active={location.pathname === "/admin/my-team"}
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
                        active={location.pathname === item.path}
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
          </SidebarSection>
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
