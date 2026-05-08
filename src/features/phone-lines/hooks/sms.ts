import {
  fetchSmsHistory,
  fetchSmsConversation,
  sendTelnyxSms,
} from "@/api/api_calls/telnyx";
import type { SendSmsPayload, SmsHistoryParams } from "@/types/api/telnyx";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const SMS_KEY = "sms";

export function useSmsThreads(
  params?: Omit<SmsHistoryParams, "threads">,
) {
  return useQuery({
    queryKey: [SMS_KEY, "threads", params],
    queryFn: () => fetchSmsHistory({ ...params, threads: true }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useSmsConversation(
  contact: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: [SMS_KEY, "conversation", contact, params],
    queryFn: () => fetchSmsConversation(contact, params),
    enabled: !!contact,
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}

export function useSendSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendSmsPayload) => sendTelnyxSms(payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant threads and conversation
      qc.invalidateQueries({ queryKey: [SMS_KEY] });
    },
  });
}
