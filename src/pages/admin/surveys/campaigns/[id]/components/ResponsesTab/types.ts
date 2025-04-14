
export interface Response {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  response_data: Record<string, any>;
  campaign_instance_id: string;
  assignment: {
    id: string;
    campaign_id: string;
    campaign: {
      id: string;
      name: string;
      anonymous: boolean;
    };
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_sbus: {
      is_primary: boolean;
      sbu: {
        id: string;
        name: string;
      };
    }[];
    user_supervisors: {
      is_primary: boolean;
      supervisor: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      };
    }[];
  };
  total_count?: number;
}

export interface FilterOptions {
  search: string;
  sortBy: "date" | "name";
  sortDirection: "asc" | "desc";
  // Additional filters can be added here in the future
}
