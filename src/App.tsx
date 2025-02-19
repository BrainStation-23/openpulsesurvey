
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import Features from "./pages/Features";
import TechStack from "./pages/TechStack";
import Login from "./pages/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLayout from "./components/layouts/AdminLayout";
import UserLayout from "./components/layouts/UserLayout";
import Dashboard from "./pages/Dashboard";

import PublicSurveyPage from "./pages/public/Survey";
import ThankYouPage from "./pages/public/ThankYou";

// User pages
import UserDashboard from "./pages/user/Dashboard";
import UserSettings from "./pages/user/Settings";
import UserMySurveys from "./pages/user/my-surveys";
import UserSurveyResponse from "./pages/user/my-surveys/[id]";
import UserAchievementsPage from "./pages/user/achievements";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminConfig from "./pages/admin/Config";
import AdminSettings from "./pages/admin/Settings";
import Users from "./pages/admin/users";
import EditUserPage from "./pages/admin/users/[id]/edit";
import MySurveysPage from "./pages/admin/my-surveys";
import SurveyResponsePage from "./pages/admin/my-surveys/[id]";
import SurveysPage from "./pages/admin/surveys";
import SurveyFormPage from "./pages/admin/surveys/SurveyFormPage";
import PreviewSurveyPage from "./pages/admin/surveys/[id]/preview";
import CampaignsPage from "./pages/admin/surveys/campaigns";
import CampaignFormPage from "./pages/admin/surveys/campaigns/CampaignFormPage";
import CampaignDetailsPage from "./pages/admin/surveys/campaigns/[id]";
import PresentationView from "./pages/admin/surveys/campaigns/[id]/components/PresentationView/index";
import PlatformConfigLayout from "./components/layouts/PlatformConfigLayout";
import ScenariosPage from "./pages/admin/email-training/scenarios";
import CreateScenarioPage from "./pages/admin/email-training/scenarios/create";
import GamePage from "./pages/email-training/game";
import EmailTrainingConfig from "./pages/admin/email-training/config";
import SBUsConfig from "./pages/admin/config/sbus";
import SBUDetails from "./pages/admin/config/sbus/[id]";
import EmailConfig from "./pages/admin/config/email";
import LevelConfig from "./pages/admin/config/level";
import LocationConfig from "./pages/admin/config/location";
import EmploymentTypeConfig from "./pages/admin/config/employment-type";
import EmployeeTypeConfig from "./pages/admin/config/employee-type";
import EmployeeRoleConfig from "./pages/admin/config/employee-role";
import AIPromptsConfig from "./pages/admin/config/ai-prompts";
import AchievementsPage from "./pages/admin/achievements";
import AchievementFormPage from "./pages/admin/achievements/AchievementFormPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/tech-stack" element={<TechStack />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          
          {/* Public routes */}
          <Route path="/public/survey/:token" element={<PublicSurveyPage />} />
          <Route path="/public/survey/:token/thank-you" element={<ThankYouPage />} />
          
          {/* User routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="my-surveys" element={<UserMySurveys />} />
            <Route path="my-surveys/:id" element={<UserSurveyResponse />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="achievements" element={<UserAchievementsPage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="my-surveys" element={<MySurveysPage />} />
            <Route path="my-surveys/:id" element={<SurveyResponsePage />} />
            <Route path="surveys" element={<SurveysPage />} />
            <Route path="surveys/create" element={<SurveyFormPage />} />
            <Route path="surveys/:id/edit" element={<SurveyFormPage />} />
            <Route path="surveys/:id/preview" element={<PreviewSurveyPage />} />
            <Route path="surveys/campaigns" element={<CampaignsPage />} />
            <Route path="surveys/campaigns/create" element={<CampaignFormPage />} />
            <Route path="surveys/campaigns/:id" element={<CampaignDetailsPage />} />
            <Route path="surveys/campaigns/:id/present" element={<PresentationView />} />
            <Route path="config" element={<PlatformConfigLayout />}>
              <Route index element={<AdminConfig />} />
              <Route path="sbus" element={<SBUsConfig />} />
              <Route path="sbus/:id" element={<SBUDetails />} />
              <Route path="email" element={<EmailConfig />} />
              <Route path="level" element={<LevelConfig />} />
              <Route path="location" element={<LocationConfig />} />
              <Route path="employment-type" element={<EmploymentTypeConfig />} />
              <Route path="employee-type" element={<EmployeeTypeConfig />} />
              <Route path="employee-role" element={<EmployeeRoleConfig />} />
              <Route path="ai-prompts" element={<AIPromptsConfig />} />
            </Route>
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="achievements/create" element={<AchievementFormPage />} />
            <Route path="achievements/:id/edit" element={<AchievementFormPage />} />
            <Route path="email-training/scenarios" element={<ScenariosPage />} />
            <Route path="email-training/scenarios/create" element={<CreateScenarioPage />} />
            <Route path="email-training/scenarios/:id/edit" element={<CreateScenarioPage />} />
            <Route path="email-training/game" element={<GamePage />} />
            <Route path="email-training/config" element={<EmailTrainingConfig />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
