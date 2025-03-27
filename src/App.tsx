import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme/theme-provider';

// Placeholder components for development purposes
const PlaceholderComponent = () => <div>Placeholder Component</div>;
const Login = PlaceholderComponent;
const Register = PlaceholderComponent;
const Dashboard = PlaceholderComponent;
const NotFound = PlaceholderComponent;
const Admin = PlaceholderComponent;
const AdminUsers = PlaceholderComponent;
const AdminOrganizations = PlaceholderComponent;
const UserProfile = PlaceholderComponent;
const UserSettings = PlaceholderComponent;
const UserSurveys = PlaceholderComponent;
const ForgotPassword = PlaceholderComponent;
const ResetPassword = PlaceholderComponent;
const Unauthorized = PlaceholderComponent;
const Contact = PlaceholderComponent;
const AdminSurveys = PlaceholderComponent;
const AdminSurveyForm = PlaceholderComponent;
const AdminSurveyEdit = PlaceholderComponent;
const AdminCampaigns = PlaceholderComponent;
const AdminCampaignForm = PlaceholderComponent;
const AdminCampaignDetails = PlaceholderComponent;
const AdminCampaignAnalyze = PlaceholderComponent;
const AdminAnalytics = PlaceholderComponent;
const AdminConfig = PlaceholderComponent;
const SurveyResponse = PlaceholderComponent;
const PublicSurvey = PlaceholderComponent;
const TeamView = PlaceholderComponent;
const AdminEmployeeRoleConfig = PlaceholderComponent;
const AdminEmployeeTypeConfig = PlaceholderComponent;
const AdminEmploymentTypeConfig = PlaceholderComponent;
const AdminLocationConfig = PlaceholderComponent;
const AdminLevelConfig = PlaceholderComponent;
const AdminUserDetails = PlaceholderComponent;
const AdminLiveSessions = PlaceholderComponent;
const AdminLiveSessionManage = PlaceholderComponent;
const LiveSessionJoin = PlaceholderComponent;
const LiveSessionPresent = PlaceholderComponent;
const AdminAchievements = PlaceholderComponent;
const AdminAchievementForm = PlaceholderComponent;
const AdminAchievementEdit = PlaceholderComponent;
const UserAchievements = PlaceholderComponent;
const AdminDashboard = PlaceholderComponent;
const AdminConfigAnalysisPrompts = PlaceholderComponent;
const AdminConfigEmailSettings = PlaceholderComponent;
const AdminCyclesPage = PlaceholderComponent;
const AdminAllObjectives = PlaceholderComponent;
const AdminOkrSettings = PlaceholderComponent;
const AdminOkrTemplates = PlaceholderComponent;
const UserObjectives = PlaceholderComponent;
const UserOkrCycles = PlaceholderComponent;
const ObjectiveDetailsPage = PlaceholderComponent;
const AdminObjectiveDetailsPage = PlaceholderComponent;
const CreateObjectivePage = PlaceholderComponent;
const AdminCreateObjectivePage = PlaceholderComponent;
const AdminCreateTemplatePage = PlaceholderComponent;
const AdminTemplateDetailsPage = PlaceholderComponent;

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
