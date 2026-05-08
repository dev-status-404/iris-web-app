import {
  fetchMyNumber,
  fetchAllNumbers,
  fetchAvailableNumbers,
  assignNumberFromPool,
  purchasePhoneNumber,
  releasePhoneNumber,
} from "@/api/api_calls/numbers";
import type { PurchaseNumberPayload } from "@/types/api/numbers";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const NUMBERS_KEY = "phone-numbers";

export function useMyNumber() {
  return useQuery({
    queryKey: [NUMBERS_KEY, "mine"],
    queryFn: fetchMyNumber,
    staleTime: 60_000,
  });
}

export function useAllNumbers(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [NUMBERS_KEY, "all", params],
    queryFn: () => fetchAllNumbers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAvailableNumbers(params?: {
  area_code?: string;
  country_code?: string;
}) {
  return useQuery({
    queryKey: [NUMBERS_KEY, "available", params],
    queryFn: () => fetchAvailableNumbers(params),
    enabled: false, // only run when explicitly triggered
  });
}

export function useAssignNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignNumberFromPool,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NUMBERS_KEY] });
    },
  });
}

export function usePurchaseNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseNumberPayload) =>
      purchasePhoneNumber(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NUMBERS_KEY] });
    },
  });
}

export function useReleaseNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => releasePhoneNumber(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NUMBERS_KEY] });
    },
  });
}
