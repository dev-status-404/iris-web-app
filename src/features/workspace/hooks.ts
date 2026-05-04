"use client";

import {
  AcceptWorkspaceInvite,
  CreateWorkspace,
  FetchWorkspaceOverview,
  InviteWorkspaceMember,
  RemoveWorkspaceMember,
  RenameWorkspace,
  ResendWorkspaceInvite,
  RevokeWorkspaceInvite,
  SelectCurrentWorkspace,
} from "@/api/api_calls/workspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

const WORKSPACE_QUERY_KEY = ["workspace-overview"];

export function useWorkspaceOverview() {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEY,
    queryFn: FetchWorkspaceOverview,
  });
}

export function useInviteWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InviteWorkspaceMember,
    onSuccess: async (data) => {
      message.success(data.message || "Invite sent");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to send invite");
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CreateWorkspace,
    onSuccess: async (data) => {
      message.success(data.message || "Workspace created");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to create workspace");
    },
  });
}

export function useSelectCurrentWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SelectCurrentWorkspace,
    onSuccess: async (data) => {
      message.success(data.message || "Workspace updated");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to switch workspace");
    },
  });
}

export function useAcceptWorkspaceInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AcceptWorkspaceInvite,
    onSuccess: async (data) => {
      message.success(data.message || "Invite accepted");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to accept invite");
    },
  });
}

export function useRenameWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RenameWorkspace,
    onSuccess: async (data) => {
      message.success(data.message || "Workspace renamed");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to rename workspace");
    },
  });
}

export function useResendWorkspaceInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ResendWorkspaceInvite,
    onSuccess: async (data) => {
      message.success(data.message || "Invite resent");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to resend invite");
    },
  });
}

export function useRevokeWorkspaceInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RevokeWorkspaceInvite,
    onSuccess: async (data) => {
      message.success(data.message || "Invite revoked");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to revoke invite");
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RemoveWorkspaceMember,
    onSuccess: async (data) => {
      message.success(data.message || "Member removed");
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEY });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to remove member");
    },
  });
}

export { WORKSPACE_QUERY_KEY };