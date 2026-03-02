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

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'archived' | 'on_hold';
  owner: User;
  created_at: string;
  updated_at: string;
  member_count: number;
  task_count: number;
  user_role: 'owner' | 'editor' | 'viewer' | null;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  user: User;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  position: number;
  project: string;
  lists: BoardList[];
  created_at: string;
  updated_at: string;
}

export interface BoardList {
  id: string;
  name: string;
  position: number;
  board: string;
  tasks: Task[];
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  project: string;
  task_count: number;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  metadata: any;
  user: User;
  task: string | null;
  task_title: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  position: number;
  board_list: string;
  project: string;
  assignees: User[];
  created_by: User;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  comment_count: number;
  attachment_count: number;
  labels: Label[];
  is_overdue: boolean;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  task: string;
  parent: string | null;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  file: string;
  filename: string;
  file_size: number;
  content_type: string;
  uploaded_by: User;
  task: string;
  created_at: string;
}
