
export interface SurveyJsonData {
  pages: Array<{
    elements: Array<{
      type: string;
      name: string;
      title: string;
      choices?: Array<{ value: string; text: string }>;
      rateMax?: number;
      rateMin?: number;
      [key: string]: any;
    }>;
  }>;
}

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  survey: {
    id: string;
    name: string;
    description: string;
    json_data: SurveyJsonData;
  };
  instance?: {
    id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
    status: string;
  } | null;
}

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}
