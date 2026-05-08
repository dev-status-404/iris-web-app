import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type { GenericResponse } from "@/types/api";
import type {
  PhoneNumber,
  PhoneNumberListResponse,
  PurchaseNumberPayload,
} from "@/types/api/numbers";

export async function fetchMyNumber(): Promise<GenericResponse<{ phoneNumber: PhoneNumber | null }>> {
  const { data } = await api.get(apiEndpoints.numbers.mine);
  return data;
}

export async function fetchAllNumbers(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PhoneNumberListResponse> {
  const { data } = await api.get(apiEndpoints.numbers.all(params));
  return data;
}

export async function fetchAvailableNumbers(params?: {
  area_code?: string;
  country_code?: string;
}): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.numbers.available(params));
  return data;
}

export async function assignNumberFromPool(): Promise<GenericResponse<{ phoneNumber: PhoneNumber }>> {
  const { data } = await api.post(apiEndpoints.numbers.assign, {});
  return data;
}

export async function purchasePhoneNumber(
  payload: PurchaseNumberPayload,
): Promise<GenericResponse<{ phoneNumber: PhoneNumber }>> {
  const { data } = await api.post(apiEndpoints.numbers.purchase, payload);
  return data;
}

export async function releasePhoneNumber(
  id: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.numbers.release(id));
  return data;
}
