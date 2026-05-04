import { WorkspaceMember, WorkspaceSummary } from "@/types/api/workspace";

export interface User {
  id?: string;
  _id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  plan?: string | null;
  avatar_url?: string | null;
  blocked?: boolean;
  is_blocked?: boolean;
  is_feedback_completed?: boolean;
  is_verified?: boolean;
  is_notifications_enabled?: boolean;
  is_update_enabled?: boolean;
  is_onboarding_completed?: boolean;
  heard_about?: string | null;
  business_name?: string | null;
  business_website?: string | null;
  primary_workspace?: WorkspaceSummary | null;
  workspace_memberships?: WorkspaceMember[];
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  isAuthenticated: boolean;
}
