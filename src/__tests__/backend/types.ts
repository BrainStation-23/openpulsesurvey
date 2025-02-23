
export interface TestUser {
  id?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface TestProfile extends TestUser {
  status: 'active' | 'inactive' | 'suspended';
  org_id?: string;
}
