import { GenericResponse } from "@/types/api";

export type EmailAddress = {
  name?: string | null;
  address: string;
};

export type InboxMessage = {
  uid: number;
  messageId?: string | null;
  subject: string;
  from: EmailAddress | null;
  to: EmailAddress[];
  cc: EmailAddress[];
  date: string;
  flags: string[];
  read: boolean;
  starred: boolean;
  size: number;
  hasAttachments: boolean;
  preview: string;
};

export type InboxMessageDetail = InboxMessage & {
  body: string;
};

export type InboxFolder = {
  path: string;
  name: string;
  delimiter: string;
};

export type InboxListData = {
  messages: InboxMessage[];
  total: number;
  page: number;
  limit: number;
  folder: string;
};

export type FetchInboxResponse = GenericResponse<InboxListData>;
export type FetchInboxMessageResponse = GenericResponse<InboxMessageDetail>;
export type FetchInboxFoldersResponse = GenericResponse<InboxFolder[]>;
export type UpdateFlagsResponse = GenericResponse<null>;
