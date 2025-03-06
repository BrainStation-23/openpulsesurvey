# Enterprise Survey Management Platform

## Overview
Open Office Survey is a comprehensive survey management platform designed for enterprises to create, distribute, and analyze surveys efficiently. It offers features like anonymous surveys, real-time analytics, and easy distribution mechanisms to gather valuable insights from team members.

## Key Features
- **Anonymous Surveys**: Ensure honest feedback with confidential response options.
- **Real-time Analytics**: Get instant insights with a powerful analytics dashboard.
- **Easy Distribution**: Share surveys effortlessly with your team via email, links, or embedded forms.
- **Campaign Management**: Create and manage survey campaigns with scheduling and automation options.
- **Role-based Access**: Secure and segmented access for administrators and participants.
- **Public Access Links**: Allow external participants to submit responses without login requirements.
- **Customizable Survey Templates**: Predefined survey templates for faster setup.
- **Data Export**: Export survey results in multiple formats (CSV, JSON, Excel) for further analysis.

## Technology Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Supabase
- **Build Tool**: Vite
- **State Management**: React Query
- **Authentication**: Supabase Auth (Email, OAuth, Magic Link)
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase account ([Sign up here](https://supabase.com/))

### Installation

1. **Clone the Repository**
   ```sh
   git clone https://github.com/BrainStation-23/openofficesurvey.git
   cd open-office-survey
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```
   
3. **Start the Development Server**
   ```sh
   npm run dev
   ```
   Your local instance should now be running at `http://localhost:3000`.

## Setting Up Supabase Backend

### 1. Create a New Supabase Project
   - Log in to [Supabase](https://supabase.com/).
   - Create a new project and note down the `Project ID`.

### 2. Run Database Setup Scripts
   Once your project is ready, navigate to **SQL Editor** and execute the following scripts in order:

   ```sh
   supabase/DB Setup/Step-1.sql
   supabase/DB Setup/Step-2.sql
   supabase/Seed Data/Default Prompts.sql
   ```

### 3. Configure Supabase Project ID
   Update your Supabase configuration file:
   ```sh
   supabase/config.toml
   ```
   Set the `project_id` field to match your Supabase project.

### 4. Update Supabase Client in the Frontend
   Modify the Supabase client file:
   ```sh
   src/integrations/supabase/client.ts
   ```
   Replace placeholders with your actual Supabase **URL** and **Public Anon Key**, which can be found under **Project Settings > Data API**.

### 5. Create an Admin User
   - Navigate to **Supabase > Authentication**.
   - Click **Add User > Create New User**.
   - Set up credentials for the first admin.
   - Go to **Table Editor > User_roles**.
   - Change the role of the newly created user to `admin`.

### 6. Run the Frontend
   ```sh
   npm run dev
   ```
   Log in using the credentials you set in the previous step and access the admin panel.

---

Built with ❤️ by **Brain Station 23**.

