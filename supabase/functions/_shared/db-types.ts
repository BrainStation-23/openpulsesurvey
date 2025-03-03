
export type UserRole = 'admin' | 'user';

export interface UserCreateData {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
}

export interface ProfileData {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  org_id?: string | null;
}

export interface BatchUserResult {
  success: boolean;
  user?: { id: string; email: string };
  error?: string;
}
