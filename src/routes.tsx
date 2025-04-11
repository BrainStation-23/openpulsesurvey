import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlatformConfigLayout from "./components/layouts/PlatformConfigLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminConfig from "./pages/admin/Config";
import Dashboard from "./pages/Dashboard";
import Surveys from "./pages/Surveys";
import SurveyCampaigns from "./pages/admin/surveys/campaigns";
import SurveyCampaignOverview from "./pages/admin/surveys/campaigns/[id]";
import SurveyCampaignAssignments from "./pages/admin/surveys/campaigns/[id]/assignments";
import SurveyCampaignInstances from "./pages/admin/surveys/campaigns/[id]/instances";
import NewSurveyCampaign from "./pages/admin/surveys/campaigns/new";
import EditSurveyCampaign from "./pages/admin/surveys/campaigns/[id]/edit";
import LiveSurveys from "./pages/admin/surveys/live";
import SurveyIssueBoards from "./pages/admin/surveys/issue-boards";
import OKRPage from "./pages/admin/okrs";
import OKRDashboard from "./pages/admin/okrs/dashboard";
import OKRCycles from "./pages/admin/okrs/cycles";
import OKRObjectives from "./pages/admin/okrs/objectives";
import OKRHistory from "./pages/admin/okrs/history";
import OKRSettings from "./pages/admin/okrs/settings";
import UsersPage from "./pages/admin/Users";
import SBUsPage from "./pages/admin/config/sbus";
import LocationPage from "./pages/admin/config/location";
import LevelPage from "./pages/admin/config/level";
import EmploymentTypePage from "./pages/admin/config/employment-type";
import EmployeeTypePage from "./pages/admin/config/employee-type";
import EmployeeRolePage from "./pages/admin/config/employee-role";
import AIAnalysisPromptsPage from "./pages/admin/config/ai-prompts";
import AchievementsPage from "./pages/admin/achievements";
import Profile from "./pages/admin/Profile";
import MyTeam from "./pages/admin/MyTeam";
import MySurveys from "./pages/admin/MySurveys";
import SettingsPage from "./pages/admin/Settings";
import Login from "./pages/Login";

// Admin Config - Email Templates
import EmailConfigPage from "./pages/admin/config/email/index";
import EmailTemplatesPage from "./pages/admin/config/email/templates/index";
import NewEmailTemplatePage from "./pages/admin/config/email/templates/new";
import EditEmailTemplatePage from "./pages/admin/config/email/templates/[id]";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "surveys",
        element: <Surveys />,
      },
      {
        path: "surveys/campaigns",
        element: <SurveyCampaigns />,
      },
      {
        path: "surveys/campaigns/new",
        element: <NewSurveyCampaign />,
      },
      {
        path: "surveys/campaigns/:id",
        element: <SurveyCampaignOverview />,
      },
      {
        path: "surveys/campaigns/:id/edit",
        element: <EditSurveyCampaign />,
      },
      {
        path: "surveys/campaigns/:id/assignments",
        element: <SurveyCampaignAssignments />,
      },
       {
        path: "surveys/campaigns/:id/instances",
        element: <SurveyCampaignInstances />,
      },
      {
        path: "surveys/live",
        element: <LiveSurveys />,
      },
      {
        path: "surveys/issue-boards",
        element: <SurveyIssueBoards />,
      },
      {
        path: "okrs",
        element: <OKRPage />,
      },
      {
        path: "okrs/dashboard",
        element: <OKRDashboard />,
      },
      {
        path: "okrs/cycles",
        element: <OKRCycles />,
      },
      {
        path: "okrs/objectives",
        element: <OKRObjectives />,
      },
      {
        path: "okrs/history",
        element: <OKRHistory />,
      },
      {
        path: "okrs/settings",
        element: <OKRSettings />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "config",
        element: <PlatformConfigLayout />,
        children: [
          { index: true, element: <AdminConfig /> },
          // Email Configuration
          { path: "email", element: <EmailConfigPage /> },
          { path: "email/templates", element: <EmailTemplatesPage /> },
          { path: "email/templates/new", element: <NewEmailTemplatePage /> },
          { path: "email/templates/:id", element: <EditEmailTemplatePage /> },
          {
            path: "sbus",
            element: <SBUsPage />,
          },
          {
            path: "config/sbus",
            element: <SBUsPage />,
          },
          {
            path: "config/location",
            element: <LocationPage />,
          },
          {
            path: "config/level",
            element: <LevelPage />,
          },
          {
            path: "config/employment-type",
            element: <EmploymentTypePage />,
          },
          {
            path: "config/employee-type",
            element: <EmployeeTypePage />,
          },
          {
            path: "config/employee-role",
            element: <EmployeeRolePage />,
          },
          {
            path: "config/ai-prompts",
            element: <AIAnalysisPromptsPage />,
          },
          {
            path: "achievements",
            element: <AchievementsPage />,
          }
        ],
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "my-team",
        element: <MyTeam />,
      },
      {
        path: "my-surveys",
        element: <MySurveys />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
