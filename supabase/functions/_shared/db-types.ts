
export type UserRole = 'admin' | 'user';

export interface UserCreateData {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  org_id?: string;
  level?: string;
  location?: string;
  employment_type?: string;
  employee_role?: string;
  employee_type?: string;
  gender?: string;
  date_of_birth?: string;
  designation?: string;
  sbus?: string;
  method?: 'SINGLE' | 'BATCH';
  users?: UserCreateData[];
}

export interface ProfileData {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  org_id?: string | null;
  level_id?: string | null;
  location_id?: string | null;
  employment_type_id?: string | null;
  employee_role_id?: string | null;
  employee_type_id?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  designation?: string | null;
}

export interface BatchUserResult {
  success: boolean;
  user?: { id: string; email: string };
  error?: string;
}
