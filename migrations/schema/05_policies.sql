
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbus ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sbus ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

-- Create policies for surveys
CREATE POLICY "Users can view assigned surveys"
    ON surveys FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM survey_assignments
            WHERE survey_id = id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admin users can manage surveys"
    ON surveys FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- ... Add more policies for other tables
