import {
  Home,
  LayoutDashboard,
  ListChecks,
  Settings,
  User,
  Users,
  Building2,
  LucideIcon,
  Mail,
  Share2,
  BarChart,
  Brain,
} from "lucide-react";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import SettingsPage from "./pages/admin/SettingsPage";
import UsersPage from "./pages/admin/UsersPage";
import UserDetailsPage from "./pages/admin/users/[id]";
import OrganizationsPage from "./pages/admin/OrganizationsPage";
import OrganizationDetailsPage from "./pages/admin/organizations/[id]";
import SurveysPage from "./pages/admin/SurveysPage";
import SurveyDetailsPage from "./pages/admin/surveys/[id]";
import CampaignsPage from "./pages/admin/CampaignsPage";
import CampaignDetailsPage from "./pages/admin/surveys/campaigns/[id]";
import LiveSessionsPage from "./pages/admin/LiveSessionsPage";
import LiveSessionDetailsPage from "./pages/admin/surveys/live/[sessionId]";
import PublicLiveSession from "./pages/live/PublicLiveSession";
import SharedPresentationsPage from "./pages/admin/surveys/shared";
import PublicPresentationView from "./pages/public/PresentationView";

interface Route {
  path: string;
  element: React.ReactNode;
  icon?: LucideIcon;
  title?: string;
}

export const routes: Route[] = [
  // Public routes
  {
    path: "/presentations/:token",
    element: <PublicPresentationView />,
  },
  
  // Admin and authenticated routes
  {
    path: "/",
    element: (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    ),
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    path: "/admin/settings",
    element: (
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    ),
    icon: Settings,
    title: "Settings",
  },
  {
    path: "/admin/users",
    element: (
      <AdminLayout>
        <UsersPage />
      </AdminLayout>
    ),
    icon: Users,
    title: "Users",
  },
  {
    path: "/admin/users/:id",
    element: (
      <AdminLayout>
        <UserDetailsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/organizations",
    element: (
      <AdminLayout>
        <OrganizationsPage />
      </AdminLayout>
    ),
    icon: Building2,
    title: "Organizations",
  },
  {
    path: "/admin/organizations/:id",
    element: (
      <AdminLayout>
        <OrganizationDetailsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/surveys",
    element: (
      <AdminLayout>
        <SurveysPage />
      </AdminLayout>
    ),
    icon: ListChecks,
    title: "Surveys",
  },
  {
    path: "/admin/surveys/:id",
    element: (
      <AdminLayout>
        <SurveyDetailsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/surveys/campaigns",
    element: (
      <AdminLayout>
        <CampaignsPage />
      </AdminLayout>
    ),
    icon: Mail,
    title: "Campaigns",
  },
  {
    path: "/admin/surveys/campaigns/:id",
    element: (
      <AdminLayout>
        <CampaignDetailsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/surveys/shared",
    element: (
      <AdminLayout>
        <SharedPresentationsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/surveys/live",
    element: (
      <AdminLayout>
        <LiveSessionsPage />
      </AdminLayout>
    ),
    icon: BarChart,
    title: "Live Sessions",
  },
  {
    path: "/admin/surveys/live/:sessionId",
    element: (
      <AdminLayout>
        <LiveSessionDetailsPage />
      </AdminLayout>
    ),
  },
  {
    path: "/live/:joinCode",
    element: <PublicLiveSession />,
  },
];
