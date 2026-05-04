export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  is_personal: boolean;
  owner_user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type WorkspaceMember = {
  id: string;
  role: "owner" | "admin" | "member";
  status: "active" | "removed";
  joined_at?: string;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  } | null;
  workspace?: WorkspaceSummary | null;
};

export type WorkspaceInvite = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at?: string;
  created_at?: string;
  accepted_at?: string | null;
  workspace?: WorkspaceSummary | null;
  invited_by_user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
};

export type WorkspaceOverview = {
  active_workspace: WorkspaceSummary | null;
  primary_workspace: WorkspaceSummary | null;
  primary_membership?: WorkspaceMember | null;
  memberships: WorkspaceMember[];
  members: WorkspaceMember[];
  sent_invites: WorkspaceInvite[];
  pending_invites: WorkspaceInvite[];
};