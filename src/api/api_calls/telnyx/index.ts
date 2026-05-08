import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type { GenericResponse } from "@/types/api";
import type {
  ActivatePhonePayload,
  CallHistoryParams,
  CallHistoryResponse,
  DialCallPayload,
  LedgerResponse,
  SendSmsPayload,
  SetOveragePayload,
  SmsConversationResponse,
  SmsHistoryParams,
  SmsHistoryResponse,
  UsageSummaryResponse,
  WalletResponse,
} from "@/types/api/telnyx";

export async function dialTelnyxCall(
  payload: DialCallPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.telnyx.calls, payload);
  return data;
}

export async function sendTelnyxSms(
  payload: SendSmsPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.telnyx.sms, payload);
  return data;
}

export async function fetchTelnyxWallet(): Promise<WalletResponse> {
  const { data } = await api.get(apiEndpoints.telnyx.wallet);
  return data;
}

export async function fetchTelnyxLedger(params?: {
  page?: number;
  limit?: number;
}): Promise<LedgerResponse> {
  const { data } = await api.get(apiEndpoints.telnyx.ledger(params));
  return data;
}

export async function fetchTelnyxUsage(params?: {
  workspace_id?: string;
}): Promise<UsageSummaryResponse> {
  const { data } = await api.get(apiEndpoints.telnyx.usage(params));
  return data;
}

export async function setTelnyxOverage(
  payload: SetOveragePayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.telnyx.overage, payload);
  return data;
}

export async function activateTelnyxPhone(
  payload: ActivatePhonePayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.telnyx.activatePhone, payload);
  return data;
}

export async function fetchCallHistory(
  params?: CallHistoryParams,
): Promise<CallHistoryResponse> {
  const { data } = await api.get(apiEndpoints.telnyx.callHistory(params));
  return data;
}

export async function fetchSmsHistory(
  params?: SmsHistoryParams,
): Promise<SmsHistoryResponse> {
  const { data } = await api.get(apiEndpoints.telnyx.smsHistory(params));
  return data;
}

export async function fetchSmsConversation(
  contact: string,
  params?: { page?: number; limit?: number },
): Promise<SmsConversationResponse> {
  const { data } = await api.get(
    apiEndpoints.telnyx.smsConversation(contact, params),
  );
  return data;
}
