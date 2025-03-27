
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon: Icon, title, href, isActive }: SidebarItemProps) => {
  return (
    <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start" asChild>
      <Link to={href} className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        <span>{title}</span>
      </Link>
    </Button>
  );
};

export function AdminSidebar() {
  // Define sidebar items
  const sidebarItems = [
    {
      icon: require('lucide-react').LayoutDashboard,
      title: 'Dashboard',
      href: '/admin',
    },
    {
      icon: require('lucide-react').Users,
      title: 'Users',
      href: '/admin/users',
    },
    {
      icon: require('lucide-react').Building,
      title: 'Organizations',
      href: '/admin/organizations',
    },
    {
      icon: require('lucide-react').ListChecks,
      title: 'Surveys',
      href: '/admin/surveys',
    },
    {
      icon: require('lucide-react').CalendarCheck,
      title: 'Campaigns',
      href: '/admin/campaigns',
    },
    {
      icon: require('lucide-react').BarChart,
      title: 'Analytics',
      href: '/admin/analytics',
    },
    {
      icon: require('lucide-react').Video,
      title: 'Live Sessions',
      href: '/admin/live-sessions',
    },
    {
      icon: require('lucide-react').Trophy,
      title: 'Achievements',
      href: '/admin/achievements',
    },
    {
      icon: require('lucide-react').Settings,
      title: 'Config',
      href: '/admin/config',
    },
    {
      icon: require('lucide-react').Target,
      title: 'OKRs',
      href: '/admin/okrs/objectives',
    }
  ];

  return (
    <Sidebar className="hidden border-r bg-background lg:block">
      <div className="h-full px-3 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              title={item.title}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
