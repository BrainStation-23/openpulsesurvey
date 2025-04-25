
export interface SurveyJsonData {
  title?: string;
  description?: string;
  logo?: string;
  logoPosition?: string;
  pages: SurveyPage[];
  [key: string]: any;
}

export interface SurveyPage {
  name: string;
  title?: string;
  elements: SurveyElement[];
  [key: string]: any;
}

export interface SurveyElement {
  name: string;
  title?: string;
  type: string;
  isRequired?: boolean;
  rateCount?: number;
  rateMax?: number;
  rateType?: string;
  [key: string]: any;
}

export interface CampaignInstance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: string;
  completion_rate?: number;
}

export interface CampaignData {
  id: string;
  name: string;
  description?: string;
  status?: string;
  starts_at?: string;
  ends_at?: string;
  completion_rate?: number;
  survey: {
    id: string;
    name: string;
    description?: string;
    json_data: SurveyJsonData;
  };
  instance: CampaignInstance | null;
}

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}

export interface SlideWrapperProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}
