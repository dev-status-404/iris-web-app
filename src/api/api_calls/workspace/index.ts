import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";
import { WorkspaceOverview } from "@/types/api/workspace";

export async function CreateWorkspace(input: {
  name: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.workspace.create, input);
  return data;
}

export async function FetchWorkspaceOverview(): Promise<GenericResponse<WorkspaceOverview>> {
  const { data } = await api.get(apiEndpoints.workspace.current);
  return data;
}

export async function InviteWorkspaceMember(input: {
  email: string;
  role?: "admin" | "member";
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.workspace.invites, input);
  return data;
}

export async function SelectCurrentWorkspace(input: {
  workspaceId: string;
}): Promise<GenericResponse<WorkspaceOverview>> {
  const { data } = await api.post(apiEndpoints.workspace.selectCurrent, input);
  return data;
}

export async function RenameWorkspace(input: {
  workspaceId: string;
  name: string;
}): Promise<GenericResponse> {
  const { data } = await api.patch(apiEndpoints.workspace.rename(input.workspaceId), {
    name: input.name,
  });
  return data;
}

export async function AcceptWorkspaceInvite(input: {
  token: string;
}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.workspace.acceptInvite, input);
  return data;
}

export async function ResendWorkspaceInvite(inviteId: string): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.workspace.resendInvite(inviteId));
  return data;
}

export async function RevokeWorkspaceInvite(inviteId: string): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.workspace.revokeInvite(inviteId));
  return data;
}

export async function RemoveWorkspaceMember(membershipId: string): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.workspace.removeMember(membershipId));
  return data;
}