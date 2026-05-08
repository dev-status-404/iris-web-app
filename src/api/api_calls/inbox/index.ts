import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  FetchInboxResponse,
  FetchInboxMessageResponse,
  FetchInboxFoldersResponse,
  UpdateFlagsResponse,
} from "@/types/api/inbox";

export async function fetchInboxMessages(
  accountId: string,
  params: { folder?: string; page?: number; limit?: number; search?: string } = {},
): Promise<FetchInboxResponse> {
  const { data } = await api.get(apiEndpoints.smtp.inbox(accountId, params));
  return data;
}

export async function fetchInboxMessage(
  accountId: string,
  uid: number | string,
  folder?: string,
): Promise<FetchInboxMessageResponse> {
  const { data } = await api.get(apiEndpoints.smtp.inboxMessage(accountId, uid, folder));
  return data;
}

export async function fetchInboxFolders(accountId: string): Promise<FetchInboxFoldersResponse> {
  const { data } = await api.get(apiEndpoints.smtp.folders(accountId));
  return data;
}

export async function markMessageRead(
  accountId: string,
  uid: number | string,
  folder?: string,
): Promise<UpdateFlagsResponse> {
  const { data } = await api.patch(apiEndpoints.smtp.inboxFlags(accountId, uid), {
    add: ["\\Seen"],
    remove: [],
    folder: folder || "INBOX",
  });
  return data;
}

export async function markMessageUnread(
  accountId: string,
  uid: number | string,
  folder?: string,
): Promise<UpdateFlagsResponse> {
  const { data } = await api.patch(apiEndpoints.smtp.inboxFlags(accountId, uid), {
    add: [],
    remove: ["\\Seen"],
    folder: folder || "INBOX",
  });
  return data;
}

export async function toggleMessageStar(
  accountId: string,
  uid: number | string,
  starred: boolean,
  folder?: string,
): Promise<UpdateFlagsResponse> {
  const { data } = await api.patch(apiEndpoints.smtp.inboxFlags(accountId, uid), {
    add: starred ? ["\\Flagged"] : [],
    remove: starred ? [] : ["\\Flagged"],
    folder: folder || "INBOX",
  });
  return data;
}
