
export interface Response {
  id: string;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_sbus?: Array<{
      sbu: {
        id: string;
        name: string;
      };
      is_primary: boolean;
    }>;
    user_supervisors?: Array<{
      supervisor: {
        id: string;
        first_name?: string;
        last_name?: string;
      };
      is_primary: boolean;
    }>;
  };
  assignment: {
    id: string;
    campaign_id: string;
    campaign?: {
      anonymous: boolean;
    };
  };
  campaign_instance_id: string;
  status: 'assigned' | 'in_progress' | 'submitted';
  response_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  primary_sbu_name?: string;
  primary_supervisor_name?: string;
}

export interface RPCResponseItem {
  id: string;
  user_id: string;
  assignment_id: string;
  campaign_instance_id: string;
  status: string;
  response_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_sbus?: Array<{
      sbu: {
        id: string;
        name: string;
      };
      is_primary: boolean;
    }>;
    user_supervisors?: Array<{
      supervisor: {
        id: string;
        first_name?: string;
        last_name?: string;
      };
      is_primary: boolean;
    }>;
  };
  campaign_anonymous: boolean;
  primary_sbu_name?: string;
  primary_supervisor_name?: string;
  state_data?: Record<string, any>;
  total_count?: number;
  // Add assignment property to match Response interface
  assignment?: {
    id: string;
    campaign_id: string;
    campaign?: {
      anonymous: boolean;
    };
  };
}

// Add the missing FilterOptions interface
export interface FilterOptions {
  search: string;
  sortBy: "date" | "name";
  sortDirection: "asc" | "desc";
}
