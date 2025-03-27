
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme/theme-provider';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import AdminUsers from './pages/admin/Users';
import AdminOrganizations from './pages/admin/Organizations';
import UserProfile from './pages/user/Profile';
import UserSettings from './pages/user/Settings';
import UserSurveys from './pages/user/Surveys';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import Contact from './pages/Contact';
import AdminSurveys from './pages/admin/surveys/Surveys';
import AdminSurveyForm from './pages/admin/surveys/SurveyForm';
import AdminSurveyEdit from './pages/admin/surveys/SurveyEdit';
import AdminCampaigns from './pages/admin/campaigns/Campaigns';
import AdminCampaignForm from './pages/admin/campaigns/CampaignForm';
import AdminCampaignDetails from './pages/admin/campaigns/CampaignDetails';
import AdminAnalytics from './pages/admin/Analytics';
import AdminConfig from './pages/admin/config';
import SurveyResponse from './pages/user/SurveyResponse';
import PublicSurvey from './pages/public/PublicSurvey';
import TeamView from './pages/user/TeamView';
import AdminEmployeeRoleConfig from './pages/admin/config/employee-role';
import AdminEmployeeTypeConfig from './pages/admin/config/employee-type';
import AdminEmploymentTypeConfig from './pages/admin/config/employment-type';
import AdminLocationConfig from './pages/admin/config/location';
import AdminLevelConfig from './pages/admin/config/level';
import AdminUserDetails from './pages/admin/UserDetails';
import AdminLiveSessions from './pages/admin/live-sessions/LiveSessions';
import AdminLiveSessionManage from './pages/admin/live-sessions/ManageSession';
import LiveSessionJoin from './pages/live-sessions/JoinSession';
import LiveSessionPresent from './pages/live-sessions/PresentSession';
import AdminCampaignAnalyze from './pages/admin/campaigns/CampaignAnalyze';
import AdminAchievements from './pages/admin/achievements/Achievements';
import AdminAchievementForm from './pages/admin/achievements/AchievementForm';
import AdminAchievementEdit from './pages/admin/achievements/AchievementEdit';
import UserAchievements from './pages/user/Achievements';
import AdminDashboard from './pages/admin/Dashboard';
import AdminConfigAnalysisPrompts from './pages/admin/config/analysis-prompts';
import AdminConfigEmailSettings from './pages/admin/config/email-settings';
import AdminCyclesPage from './pages/admin/okrs/Cycles';
import AdminAllObjectives from './pages/admin/okrs/Objectives';
import AdminOkrSettings from './pages/admin/okrs/OkrSettings';
import AdminOkrTemplates from './pages/admin/okrs/Templates';
import UserObjectives from './pages/user/okrs/Objectives';
import UserOkrCycles from './pages/user/okrs/Cycles';
import ObjectiveDetailsPage from './pages/user/okrs/ObjectiveDetails';
import AdminObjectiveDetailsPage from './pages/admin/okrs/ObjectiveDetails';
import CreateObjectivePage from './pages/user/okrs/CreateObjective';
import AdminCreateObjectivePage from './pages/admin/okrs/CreateObjective';
import AdminCreateTemplatePage from './pages/admin/okrs/CreateTemplate';
import AdminTemplateDetailsPage from './pages/admin/okrs/TemplateDetails';

// Import layouts
import RootLayout from './components/layouts/RootLayout';
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Login />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'survey/:token',
        element: <PublicSurvey />
      },
      {
        path: 'live-session/:code',
        element: <LiveSessionJoin />
      },
      {
        path: 'present/:id',
        element: <LiveSessionPresent />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <UserLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'profile',
        element: <UserProfile />
      },
      {
        path: 'settings',
        element: <UserSettings />
      },
      {
        path: 'surveys',
        element: <UserSurveys />
      },
      {
        path: 'surveys/:id',
        element: <SurveyResponse />
      },
      {
        path: 'team',
        element: <TeamView />
      },
      {
        path: 'achievements',
        element: <UserAchievements />
      },
      {
        path: 'okrs',
        children: [
          {
            index: true,
            element: <UserObjectives />
          },
          {
            path: 'objectives',
            element: <UserObjectives />
          },
          {
            path: 'objectives/create',
            element: <CreateObjectivePage />
          },
          {
            path: 'objectives/:id',
            element: <ObjectiveDetailsPage />
          },
          {
            path: 'cycles',
            element: <UserOkrCycles />
          }
        ]
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: 'users',
        element: <AdminUsers />
      },
      {
        path: 'users/:id',
        element: <AdminUserDetails />
      },
      {
        path: 'organizations',
        element: <AdminOrganizations />
      },
      {
        path: 'surveys',
        element: <AdminSurveys />
      },
      {
        path: 'surveys/create',
        element: <AdminSurveyForm />
      },
      {
        path: 'surveys/:id',
        element: <AdminSurveyEdit />
      },
      {
        path: 'campaigns',
        element: <AdminCampaigns />
      },
      {
        path: 'campaigns/create',
        element: <AdminCampaignForm />
      },
      {
        path: 'campaigns/:id',
        element: <AdminCampaignDetails />
      },
      {
        path: 'campaigns/:id/analyze',
        element: <AdminCampaignAnalyze />
      },
      {
        path: 'analytics',
        element: <AdminAnalytics />
      },
      {
        path: 'live-sessions',
        element: <AdminLiveSessions />
      },
      {
        path: 'live-sessions/:id',
        element: <AdminLiveSessionManage />
      },
      {
        path: 'achievements',
        element: <AdminAchievements />
      },
      {
        path: 'achievements/create',
        element: <AdminAchievementForm />
      },
      {
        path: 'achievements/:id',
        element: <AdminAchievementEdit />
      },
      {
        path: 'config',
        element: <AdminConfig />
      },
      {
        path: 'config/employee-role',
        element: <AdminEmployeeRoleConfig />
      },
      {
        path: 'config/employee-type',
        element: <AdminEmployeeTypeConfig />
      },
      {
        path: 'config/employment-type',
        element: <AdminEmploymentTypeConfig />
      },
      {
        path: 'config/location',
        element: <AdminLocationConfig />
      },
      {
        path: 'config/level',
        element: <AdminLevelConfig />
      },
      {
        path: 'config/analysis-prompts',
        element: <AdminConfigAnalysisPrompts />
      },
      {
        path: 'config/email-settings',
        element: <AdminConfigEmailSettings />
      },
      {
        path: 'okrs/objectives',
        element: <AdminAllObjectives />
      },
      {
        path: 'okrs/objectives/create',
        element: <AdminCreateObjectivePage />
      },
      {
        path: 'okrs/objectives/:id',
        element: <AdminObjectiveDetailsPage />
      },
      {
        path: 'okrs/cycles',
        element: <AdminCyclesPage />
      },
      {
        path: 'okrs/templates',
        element: <AdminOkrTemplates />
      },
      {
        path: 'okrs/templates/create',
        element: <AdminCreateTemplatePage />
      },
      {
        path: 'okrs/templates/:id',
        element: <AdminTemplateDetailsPage />
      },
      {
        path: 'okrs/settings',
        element: <AdminOkrSettings />
      }
    ]
  }
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
