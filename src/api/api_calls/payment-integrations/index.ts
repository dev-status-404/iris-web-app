import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  ConnectPaymentIntegrationPayload,
  PaymentIntegrationResponse,
  PaymentIntegrationsResponse,
  UpdatePaymentIntegrationPayload,
} from "@/types/api/payment-integration";

export async function connectPaymentIntegration(
  payload: ConnectPaymentIntegrationPayload,
): Promise<PaymentIntegrationResponse> {
  const { data } = await api.post(apiEndpoints.paymentIntegrations.base, payload);
  return data;
}

export async function fetchPaymentIntegrations(): Promise<PaymentIntegrationsResponse> {
  const { data } = await api.get(apiEndpoints.paymentIntegrations.base);
  return data;
}

export async function fetchPaymentIntegration(
  integrationId: string,
): Promise<PaymentIntegrationResponse> {
  const { data } = await api.get(apiEndpoints.paymentIntegrations.getOne(integrationId));
  return data;
}

export async function updatePaymentIntegration(
  integrationId: string,
  payload: UpdatePaymentIntegrationPayload,
): Promise<PaymentIntegrationResponse> {
  const { data } = await api.patch(
    apiEndpoints.paymentIntegrations.update(integrationId),
    payload,
  );
  return data;
}

export async function deletePaymentIntegration(
  integrationId: string,
): Promise<PaymentIntegrationResponse> {
  const { data } = await api.delete(apiEndpoints.paymentIntegrations.delete(integrationId));
  return data;
}

export async function verifyPaymentIntegration(
  integrationId: string,
): Promise<PaymentIntegrationResponse> {
  const { data } = await api.post(apiEndpoints.paymentIntegrations.verify(integrationId));
  return data;
}
