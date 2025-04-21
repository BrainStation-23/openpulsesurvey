
export type InstanceStatus = 'upcoming' | 'active' | 'completed' | 'inactive';

export interface Instance {
  id: string;
  campaign_id: string;
  starts_at: string;
  ends_at: string;
  status: InstanceStatus;
  period_number: number;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
}

export interface CreateInstanceData {
  campaign_id: string;
  starts_at: string;
  ends_at: string;
  status: InstanceStatus;
  period_number: number;
}

export interface InstanceSortOptions {
  sortBy: 'period_number' | 'starts_at' | 'ends_at' | 'status' | 'completion_rate';
  sortDirection: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}
