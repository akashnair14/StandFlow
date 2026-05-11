export type Role = 'manager' | 'employee';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
}

export interface ReportContent {
  completed: string[];
  planned: string[];
  blockers: string[];
}

export interface Report {
  id: string;
  user_id: string;
  team_id: string;
  content: ReportContent;
  created_at: string;
  date: string;
  profile?: Profile;
}
