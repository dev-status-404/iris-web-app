import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type { GenericResponse } from "@/types/api";

export async function fetchGoogleStatus(): Promise<GenericResponse<{ connected: boolean }>> {
  const { data } = await api.get(apiEndpoints.google.status);
  return data;
}

export async function fetchGoogleAuthUrl(): Promise<GenericResponse<{ url: string }>> {
  const { data } = await api.get(apiEndpoints.google.authUrl);
  return data;
}

export async function disconnectGoogle(): Promise<GenericResponse<null>> {
  const { data } = await api.delete(apiEndpoints.google.disconnect);
  return data;
}
