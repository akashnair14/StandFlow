export type Role = 'manager' | 'team_leader' | 'team_member';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: Role;
  updated_at: string;
  social_links?: {
    slack?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    whatsapp?: string;
  } | null;
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
  profiles?: Profile | null;
}

export interface ReportContent {
  completed: string[] | string;
  planned: string[] | string;
  blockers: string[] | string;
  mood?: string;
}

export interface Report {
  id: string;
  user_id: string;
  team_id: string;
  content: ReportContent;
  created_at: string;
  date: string;
  profiles?: Profile | null;
}
