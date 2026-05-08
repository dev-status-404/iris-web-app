import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGoogleStatus, fetchGoogleAuthUrl, disconnectGoogle } from "@/api/api_calls/google";

export const GOOGLE_KEY = "google-integration";

export function useGoogleStatus() {
  return useQuery({
    queryKey: [GOOGLE_KEY, "status"],
    queryFn: fetchGoogleStatus,
    staleTime: 30_000,
  });
}

export function useGoogleAuthUrl() {
  return useQuery({
    queryKey: [GOOGLE_KEY, "auth-url"],
    queryFn: fetchGoogleAuthUrl,
    enabled: false,
  });
}

export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GOOGLE_KEY] });
    },
  });
}
