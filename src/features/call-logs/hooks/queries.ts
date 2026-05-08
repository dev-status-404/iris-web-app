import {
  fetchCallHistory,
} from "@/api/api_calls/telnyx";
import type { CallHistoryParams } from "@/types/api/telnyx";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const CALL_HISTORY_KEY = "call-history";

export function useCallHistory(params?: CallHistoryParams) {
  return useQuery({
    queryKey: [CALL_HISTORY_KEY, params],
    queryFn: () => fetchCallHistory(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
