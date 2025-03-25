
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type BreadcrumbItem = {
  title: string;
  path: string;
  isLast: boolean;
};

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    if (index === 0 && path === 'user') return;
    
    let title = path.charAt(0).toUpperCase() + path.slice(1);
    
    breadcrumbs.push({
      title,
      path: currentPath,
      isLast: index === paths.length - 1
    });
  });
  
  return breadcrumbs;
};

export default function UserHeader() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const { user } = useCurrentUser();
  
  const userInitials = user?.email ? 
    user.email.split('@')[0].substring(0, 2).toUpperCase() : 
    "U";

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <SidebarTrigger className="mr-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to="/user/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb) => (
                <BreadcrumbItem key={crumb.path}>
                  <BreadcrumbSeparator />
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                      {crumb.title}
                    </Link>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          <div className="border-l h-6 mx-2"></div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
