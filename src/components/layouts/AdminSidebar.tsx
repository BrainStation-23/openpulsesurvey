
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
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
    <Sidebar defaultOpen={true}>
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold">Admin Panel</span>
        <ChevronLeft className="ml-auto h-4 w-4" />
      </div>
      <div className="p-4">
        <div className="mb-4">
          <NavLink to="/admin" end className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/organizations" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Building2 size={20} />
            <span>Organizations</span>
          </NavLink>
        </div>
        <div className="mb-4">
          <h3 className="mb-2 px-3 text-sm font-medium">Surveys</h3>
          <NavLink to="/admin/surveys" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <List size={20} />
            <span>Surveys</span>
          </NavLink>
          <NavLink to="/admin/campaigns" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Calendar size={20} />
            <span>Campaigns</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <BarChart size={20} />
            <span>Analytics</span>
          </NavLink>
          <NavLink to="/admin/live-sessions" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <MessageSquare size={20} />
            <span>Live Sessions</span>
          </NavLink>
        </div>
        <div className="mb-4">
          <h3 className="mb-2 px-3 text-sm font-medium">OKRs</h3>
          <NavLink to="/admin/okrs/objectives" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Target size={20} />
            <span>Objectives</span>
          </NavLink>
          <NavLink to="/admin/okrs/cycles" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Calendar size={20} />
            <span>OKR Cycles</span>
          </NavLink>
          <NavLink to="/admin/okrs/templates" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <List size={20} />
            <span>Templates</span>
          </NavLink>
          <NavLink to="/admin/okrs/settings" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Settings size={20} />
            <span>OKR Settings</span>
          </NavLink>
        </div>
        <div className="mb-4">
          <h3 className="mb-2 px-3 text-sm font-medium">System</h3>
          <NavLink to="/admin/achievements" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Award size={20} />
            <span>Achievements</span>
          </NavLink>
          <NavLink to="/admin/config" className={({isActive}) => 
            `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}>
            <Settings size={20} />
            <span>Config</span>
          </NavLink>
        </div>
        <div>
          <button 
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
