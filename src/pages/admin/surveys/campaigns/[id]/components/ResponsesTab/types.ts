
export type SortOption = "date" | "name";
export type SortDirection = "asc" | "desc";

export type FilterOptions = {
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
};

export interface Response {
  id: string;
  status: "assigned" | "in_progress" | "submitted" | "expired";
  created_at: string;
  updated_at: string;
  campaign_instance_id: string | null;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
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
        first_name: string | null;
        last_name: string | null;
        email: string;
      };
    }[];
  };
  assignment: {
    id: string;
    campaign_id: string;
    campaign: {
      id: string;
      name: string;
      anonymous: boolean;
    };
  };
}
