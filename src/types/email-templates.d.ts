
export interface TemplateVariable {
  id: string;
  name: string;
  description: string;
  default_value: string;
  sample_value: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html_content: string;
  plain_text_content: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  available_variables: string[];
  created_at: string;
  updated_at: string;
}
