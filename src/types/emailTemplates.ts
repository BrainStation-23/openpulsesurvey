
export type EmailTemplateStatus = 'active' | 'inactive' | 'draft';

export type EmailTemplateCategory = 
  | 'notification' 
  | 'welcome' 
  | 'reminder' 
  | 'survey' 
  | 'report' 
  | 'password_reset'
  | 'invitation'
  | 'other';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  html_content: string;
  plain_text_content: string | null;
  category: EmailTemplateCategory;
  available_variables: string[];
  created_at: string;
  updated_at: string;
  status: EmailTemplateStatus;
  created_by: string | null;
}

export interface TemplateVariable {
  id: string;
  name: string;
  description: string | null;
  default_value: string | null;
  sample_value: string | null;
  variable_type: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TemplateVariableAssociation {
  id: string;
  template_id: string;
  variable_id: string;
  created_at: string;
}
