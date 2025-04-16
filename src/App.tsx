import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/hooks/use-toast";
import { ReactQueryProvider } from "@/lib/react-query";
import DashboardPage from "./pages/admin/dashboard";
import SurveysPage from "./pages/admin/surveys";
import CreateSurveyPage from "./pages/admin/surveys/create";
import EditSurveyPage from "./pages/admin/surveys/[id]/edit";
import PreviewSurveyPage from "./pages/admin/surveys/[id]/preview";
import CampaignsPage from "./pages/admin/surveys/campaigns";
import CreateCampaignPage from "./pages/admin/surveys/campaigns/create";
import CampaignDetailsPage from "./pages/admin/surveys/campaigns/[id]";
import CampaignReportsPage from "./pages/admin/surveys/campaigns/[id]/reports";
import CampaignAssignmentsPage from "./pages/admin/surveys/campaigns/[id]/assignments";
import CampaignResponsesPage from "./pages/admin/surveys/campaigns/[id]/responses";
import LoginPage from "./pages/login";
import AdminLayout from "./components/layouts/AdminLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import PublicSurveyPage from "./pages/public/surveys/[token]";
import PublicSubmissionPage from "./pages/public/surveys/[token]/submit";
import SettingsPage from "./pages/admin/settings";
import CampaignInstancesPage from "./pages/admin/surveys/campaigns/[id]/instances";

export default function App() {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Public Routes */}
              <Route path="/surveys/:token" element={<PublicLayout />}>
                <Route index element={<PublicSurveyPage />} />
                <Route path="submit" element={<PublicSubmissionPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>

              <Route path="/admin/surveys" element={<AdminLayout />}>
                <Route index element={<SurveysPage />} />
                <Route path="create" element={<CreateSurveyPage />} />
                <Route path=":id/edit" element={<EditSurveyPage />} />
                <Route path=":id/preview" element={<PreviewSurveyPage />} />
              </Route>

              <Route path="/admin/surveys/campaigns" element={<AdminLayout />}>
                <Route index element={<CampaignsPage />} />
                <Route path="create" element={<CreateCampaignPage />} />
                <Route path=":id" element={<CampaignDetailsPage />} />
                <Route path=":id/reports" element={<CampaignReportsPage />} />
                <Route path=":id/assignments" element={<CampaignAssignmentsPage />} />
                <Route path=":id/responses" element={<CampaignResponsesPage />} />
              </Route>

              <Route path="/admin/settings" element={<AdminLayout />}>
                <Route index element={<SettingsPage />} />
              </Route>
              
              {/* Campaign instance configuration route */}
              <Route path="/admin/surveys/campaigns/:id/instances" element={<AdminLayout />}>
                <Route index element={<CampaignInstancesPage />} />
              </Route>
              
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
