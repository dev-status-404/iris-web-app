import { GenericResponse } from "@/types/api";

export type DialCallPayload = {
  to: string;
  from?: string;
  webhook_url?: string;
  workspace_id?: string;
};

export type SendSmsPayload = {
  to: string;
  from?: string;
  text?: string;
  media_urls?: string[];
  workspace_id?: string;
};

export type SetOveragePayload = {
  workspace_id?: string;
  opt_in: boolean;
};

export type ActivatePhonePayload = {
  workspace_id: string;
};

export type WalletBalance = {
  balance?: number;
  available_credit?: number;
  currency?: string;
};

export type UsageSummary = Record<string, unknown>;

export type WalletResponse = GenericResponse<WalletBalance>;
export type LedgerResponse = GenericResponse<unknown[]>;
export type UsageSummaryResponse = GenericResponse<UsageSummary>;

// ─── Call history ─────────────────────────────────────────────────────────────

export type CallRecord = {
  _id: string;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  status: string;
  duration_seconds?: number;
  recording_url?: string;
  transcript?: string;
  lead_id?: { _id: string; first_name?: string; last_name?: string; emails?: string[] } | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type CallHistoryParams = {
  page?: number;
  limit?: number;
  direction?: "inbound" | "outbound";
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CallHistoryResponse = GenericResponse<{
  calls: CallRecord[];
  pagination: PaginationMeta;
}>;

// ─── SMS history ─────────────────────────────────────────────────────────────

export type SmsRecord = {
  _id: string;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  body: string;
  media_urls?: string[];
  status: string;
  lead_id?: { _id: string; first_name?: string; last_name?: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type SmsThread = {
  _id: string; // contact phone number
  last_message: SmsRecord;
  unread_count: number;
  total: number;
};

export type SmsHistoryParams = {
  page?: number;
  limit?: number;
  direction?: "inbound" | "outbound";
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  threads?: boolean;
};

export type SmsHistoryResponse = GenericResponse<{
  messages?: SmsRecord[];
  threads?: SmsThread[];
  pagination: Partial<PaginationMeta>;
}>;

export type SmsConversationResponse = GenericResponse<{
  messages: SmsRecord[];
  contact: string;
  pagination: PaginationMeta;
}>;

