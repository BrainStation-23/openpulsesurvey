
-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  available_variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template variables table
CREATE TABLE IF NOT EXISTS template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_value TEXT,
  sample_value TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some default template variables
INSERT INTO template_variables (name, description, default_value, sample_value, category)
VALUES
  ('user_name', 'Full name of the user', 'User', 'John Doe', 'user'),
  ('user_first_name', 'First name of the user', 'User', 'John', 'user'),
  ('user_last_name', 'Last name of the user', '', 'Doe', 'user'),
  ('user_email', 'Email address of the user', 'user@example.com', 'john.doe@example.com', 'user'),
  ('company_name', 'Name of the company', 'Our Company', 'Acme Inc', 'company'),
  ('company_address', 'Company address', '123 Main St, City', '123 Main St, San Francisco, CA', 'company'),
  ('company_phone', 'Company phone number', '555-1234', '(555) 123-4567', 'company'),
  ('survey_name', 'Name of the survey', 'Survey', 'Customer Satisfaction Survey', 'survey'),
  ('survey_link', 'Link to access the survey', 'https://example.com/survey', 'https://example.com/survey/abc123', 'survey'),
  ('survey_expiry_date', 'Expiration date of the survey', '2023-12-31', '2023-12-31', 'survey'),
  ('reset_password_link', 'Password reset link', 'https://example.com/reset', 'https://example.com/reset?token=abc123', 'authentication'),
  ('verification_code', 'Verification code for account setup', '123456', '437829', 'authentication'),
  ('verification_link', 'Verification link for account setup', 'https://example.com/verify', 'https://example.com/verify?token=abc123', 'authentication'),
  ('current_date', 'Current date', '2023-01-01', '2023-04-15', 'system'),
  ('unsubscribe_link', 'Link to unsubscribe from emails', 'https://example.com/unsubscribe', 'https://example.com/unsubscribe?id=abc123', 'system');

-- Insert a default welcome email template
INSERT INTO email_templates (name, description, subject, html_content, plain_text_content, category, status, available_variables)
VALUES (
  'Welcome Email',
  'Email sent to users when they first register an account',
  'Welcome to {{company_name}}!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Welcome to {{company_name}}!</h1>
    <p>Hello {{user_first_name}},</p>
    <p>Thank you for registering with us. We are excited to have you on board!</p>
    <p>Your account has been created successfully. You can now access all our services.</p>
    <p>If you have any questions or need assistance, please don''t hesitate to contact us.</p>
    <p>Best regards,<br>The {{company_name}} Team</p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #777;">
      This is an automated email. Please do not reply to this message.
      <br>
      <a href="{{unsubscribe_link}}" style="color: #777;">Unsubscribe</a>
    </p>
  </div>',
  'Welcome to {{company_name}}!

Hello {{user_first_name}},

Thank you for registering with us. We are excited to have you on board!

Your account has been created successfully. You can now access all our services.

If you have any questions or need assistance, please don''t hesitate to contact us.

Best regards,
The {{company_name}} Team

---
This is an automated email. Please do not reply to this message.
To unsubscribe, visit: {{unsubscribe_link}}',
  'notification',
  'active',
  ARRAY['user_first_name', 'company_name', 'unsubscribe_link']
);

-- Create RLS policies for email templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can access templates
CREATE POLICY "Admin can CRUD email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

-- Create RLS policies for template variables
ALTER TABLE template_variables ENABLE ROW LEVEL SECURITY;

-- Only admins can modify variables, but all users can view them
CREATE POLICY "Admin can CRUD template variables" ON template_variables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "All users can view template variables" ON template_variables
  FOR SELECT USING (true);
