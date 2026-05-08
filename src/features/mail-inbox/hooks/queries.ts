import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInboxMessages,
  fetchInboxMessage,
  fetchInboxFolders,
  markMessageRead,
  markMessageUnread,
  toggleMessageStar,
} from "@/api/api_calls/inbox";

export const inboxKeys = {
  all: ["inbox"] as const,
  messages: (accountId: string, folder: string, page: number, search: string) =>
    ["inbox", accountId, folder, page, search] as const,
  message: (accountId: string, uid: number | string) =>
    ["inbox", accountId, "message", uid] as const,
  folders: (accountId: string) => ["inbox", accountId, "folders"] as const,
};

export const useFetchInboxMessages = (
  accountId: string,
  { folder = "INBOX", page = 1, limit = 30, search = "" } = {},
) =>
  useQuery({
    queryKey: inboxKeys.messages(accountId, folder, page, search),
    queryFn: () => fetchInboxMessages(accountId, { folder, page, limit, search }),
    enabled: Boolean(accountId),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useFetchInboxMessage = (
  accountId: string,
  uid: number | string | null,
  folder?: string,
) =>
  useQuery({
    queryKey: uid ? inboxKeys.message(accountId, uid) : ["inbox", "noop"],
    queryFn: () => fetchInboxMessage(accountId, uid!, folder),
    enabled: Boolean(accountId) && uid !== null,
    staleTime: 5 * 60 * 1000,
  });

export const useFetchInboxFolders = (accountId: string) =>
  useQuery({
    queryKey: inboxKeys.folders(accountId),
    queryFn: () => fetchInboxFolders(accountId),
    enabled: Boolean(accountId),
    staleTime: 10 * 60 * 1000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, uid, folder }: { accountId: string; uid: number | string; folder?: string }) =>
      markMessageRead(accountId, uid, folder),
    onSuccess: (_, { accountId }) => {
      qc.invalidateQueries({ queryKey: ["inbox", accountId] });
    },
  });
};

export const useMarkUnread = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, uid, folder }: { accountId: string; uid: number | string; folder?: string }) =>
      markMessageUnread(accountId, uid, folder),
    onSuccess: (_, { accountId }) => {
      qc.invalidateQueries({ queryKey: ["inbox", accountId] });
    },
  });
};

export const useToggleStar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      uid,
      starred,
      folder,
    }: { accountId: string; uid: number | string; starred: boolean; folder?: string }) =>
      toggleMessageStar(accountId, uid, starred, folder),
    onSuccess: (_, { accountId }) => {
      qc.invalidateQueries({ queryKey: ["inbox", accountId] });
    },
  });
};
