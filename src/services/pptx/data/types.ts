
import { SurveyQuestion, CampaignMetadata, Respondent, QuestionResponse, ProcessedResponse, PresentationData } from "../types";

// Campaign and survey related types
export interface CampaignData {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  completion_rate: number;
  survey: {
    id: string;
    name: string;
    json_data: any;
  };
}

export interface InstanceData {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: string;
  completion_rate: number;
}

export interface SurveyData {
  pages?: Array<{
    elements?: Array<{
      name?: string;
      title?: string;
      type?: string;
      rateMax?: number;
    }>;
  }>;
}

// Response related types
export interface ResponseBasicData {
  id: string;
  response_data: Record<string, any>;
  submitted_at: string;
  user_id: string;
}

// User profile related types
export interface UserProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  gender: string | null;
  location: {
    id: string;
    name: string;
  } | null;
  employment_type: {
    id: string;
    name: string;
  } | null;
  level: {
    id: string;
    name: string;
  } | null;
  employee_type: {
    id: string;
    name: string;
  } | null;
  employee_role: {
    id: string;
    name: string;
  } | null;
}

export interface SbuData {
  user_id: string;
  is_primary: boolean;
  sbu: {
    id: string;
    name: string;
  } | null;
}

export interface SupervisorRelation {
  user_id: string;
  is_primary: boolean;
  supervisor_id: string;
}

export interface SupervisorProfile {
  id: string;
  first_name: string;
  last_name: string;
}

// Maps for efficient data lookups
export interface DataMaps {
  userMap: Map<string, UserProfileData>;
  sbuMap: Map<string, SbuData["sbu"]>;
  supervisorMap: Map<string, SupervisorProfile>;
}

// Aggregated data structure returned from data fetching functions
export interface FetchedPresentationData {
  campaign: CampaignData;
  instance: InstanceData | null;
  questions: SurveyQuestion[];
  responses: ResponseBasicData[];
  dataMaps: DataMaps;
}
