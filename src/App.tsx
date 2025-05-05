import React, { Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Surveys from "./pages/admin/Surveys";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import SBUs from "./pages/admin/SBUs";
import EmailConfig from "./pages/admin/EmailConfig";
import LocationConfig from "./pages/admin/LocationConfig";
import LevelConfig from "./pages/admin/LevelConfig";
import EmploymentTypeConfig from "./pages/admin/EmploymentTypeConfig";
import EmployeeTypeConfig from "./pages/admin/EmployeeTypeConfig";
import EmployeeRoleConfig from "./pages/admin/EmployeeRoleConfig";
import Campaigns from "./pages/admin/surveys/Campaigns";
import OKRDashboard from "./pages/admin/okrs/Dashboard";
import OKRCycles from "./pages/admin/okrs/OKRCycles";
import OKRObjectives from "./pages/admin/okrs/OKRObjectives";
import OKRSettings from "./pages/admin/okrs/OkrSettings";
import AIConfig from "./pages/admin/AIConfig";
import Achievements from "./pages/admin/Achievements";
import LiveSessions from "./pages/admin/surveys/LiveSessions";
import LiveSessionDetails from "./pages/admin/surveys/live/[sessionId]";
import IssueBoards from "./pages/admin/surveys/IssueBoards";
import OKRHistory from "./pages/admin/okrs/OKRHistory";
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient();

function App() {
  const NotFound = () => {
    return <Navigate to="/dashboard" replace />;
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={
          createBrowserRouter([
            {
              path: "/",
              element: <Navigate to="/login" replace />,
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
              path: "*",
              element: <NotFound />,
            },
            {
              path: "/admin",
              element: <AdminLayout />,
              children: [
                {
                  path: "/admin/dashboard",
                  element: <AdminDashboard />,
                },
                {
                  path: "/admin/surveys",
                  element: <Surveys />,
                },
                {
                  path: "/admin/surveys/campaigns",
                  element: <Campaigns />,
                },
                {
                  path: "/admin/surveys/live",
                  element: <LiveSessions />,
                },
                {
                  path: "/admin/surveys/live/:sessionId",
                  element: <LiveSessionDetails />,
                },
                {
                  path: "/admin/surveys/issue-boards",
                  element: <IssueBoards />,
                },
                {
                  path: "/admin/users",
                  element: <Users />,
                },
                // Settings routes
                {
                  path: "/admin/settings",
                  element: <Settings />,
                },
                {
                  path: "/admin/settings/system-info",
                  element: <React.lazy(() => import("./pages/admin/settings/SystemInfo")) />,
                },
                {
                  path: "/admin/config/sbus",
                  element: <SBUs />,
                },
                {
                  path: "/admin/config/email",
                  element: <EmailConfig />,
                },
                {
                  path: "/admin/config/location",
                  element: <LocationConfig />,
                },
                {
                  path: "/admin/config/level",
                  element: <LevelConfig />,
                },
                {
                  path: "/admin/config/employment-type",
                  element: <EmploymentTypeConfig />,
                },
                {
                  path: "/admin/config/employee-type",
                  element: <EmployeeTypeConfig />,
                },
                {
                  path: "/admin/config/employee-role",
                  element: <EmployeeRoleConfig />,
                },
                {
                  path: "/admin/okrs/dashboard",
                  element: <OKRDashboard />,
                },
                {
                  path: "/admin/okrs/cycles",
                  element: <OKRCycles />,
                },
                {
                  path: "/admin/okrs/objectives",
                  element: <OKRObjectives />,
                },
                {
                  path: "/admin/okrs/history",
                  element: <OKRHistory />,
                },
                {
                  path: "/admin/okrs/settings",
                  element: <OKRSettings />,
                },
                {
                  path: "/admin/config/ai-prompts",
                  element: <AIConfig />,
                },
                {
                  path: "/admin/achievements",
                  element: <Achievements />,
                },
              ],
            },
          ])
        }
      />
      <Toaster />
    </RouterProvider>
  );
}

export default App;
