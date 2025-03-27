
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarSection, SidebarItem } from '@/components/ui/sidebar';
import { 
  ChevronLeft, 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart, 
  Building2, 
  LogOut,
  Target,
  Calendar,
  List,
  MessageSquare,
  Award
} from 'lucide-react';

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  return (
    <Sidebar defaultCollapsed={false}>
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold">Admin Panel</span>
        <ChevronLeft className="ml-auto h-4 w-4" />
      </div>
      <div className="p-4">
        <SidebarSection>
          <SidebarItem icon={<LayoutDashboard size={20} />} title="Dashboard" as={NavLink} to="/admin" end />
          <SidebarItem icon={<Users size={20} />} title="Users" as={NavLink} to="/admin/users" />
          <SidebarItem icon={<Building2 size={20} />} title="Organizations" as={NavLink} to="/admin/organizations" />
        </SidebarSection>
        <SidebarSection title="Surveys">
          <SidebarItem icon={<List size={20} />} title="Surveys" as={NavLink} to="/admin/surveys" />
          <SidebarItem icon={<Calendar size={20} />} title="Campaigns" as={NavLink} to="/admin/campaigns" />
          <SidebarItem icon={<BarChart size={20} />} title="Analytics" as={NavLink} to="/admin/analytics" />
          <SidebarItem icon={<MessageSquare size={20} />} title="Live Sessions" as={NavLink} to="/admin/live-sessions" />
        </SidebarSection>
        <SidebarSection title="OKRs">
          <SidebarItem icon={<Target size={20} />} title="Objectives" as={NavLink} to="/admin/okrs/objectives" />
          <SidebarItem icon={<Calendar size={20} />} title="OKR Cycles" as={NavLink} to="/admin/okrs/cycles" />
          <SidebarItem icon={<List size={20} />} title="Templates" as={NavLink} to="/admin/okrs/templates" />
          <SidebarItem icon={<Settings size={20} />} title="OKR Settings" as={NavLink} to="/admin/okrs/settings" />
        </SidebarSection>
        <SidebarSection title="System">
          <SidebarItem icon={<Award size={20} />} title="Achievements" as={NavLink} to="/admin/achievements" />
          <SidebarItem icon={<Settings size={20} />} title="Config" as={NavLink} to="/admin/config" />
        </SidebarSection>
        <SidebarSection>
          <SidebarItem icon={<LogOut size={20} />} title="Sign Out" onClick={onSignOut} />
        </SidebarSection>
      </div>
    </Sidebar>
  );
}
