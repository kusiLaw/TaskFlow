export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  full_name: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  owner: User;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user: User;
  organization: Organization;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joined_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  organization: string;
  organization_name: string;
  invited_by: User;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  is_valid: boolean;
  token: string;
}