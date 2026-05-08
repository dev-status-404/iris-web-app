import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  CreateInvoicePayload,
  InvoiceResponse,
  InvoicesResponse,
  UpdateInvoicePayload,
} from "@/types/api/invoice";

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<InvoiceResponse> {
  const { data } = await api.post(apiEndpoints.invoices.base, payload);
  return data;
}

export async function fetchInvoices(
  params?: Record<string, string | number | boolean | undefined>,
): Promise<InvoicesResponse> {
  const { data } = await api.get(apiEndpoints.invoices.base, { params });
  return data;
}

export async function fetchInvoice(invoiceId: string): Promise<InvoiceResponse> {
  const { data } = await api.get(apiEndpoints.invoices.getOne(invoiceId));
  return data;
}

export async function updateInvoice(
  invoiceId: string,
  payload: UpdateInvoicePayload,
): Promise<InvoiceResponse> {
  const { data } = await api.patch(apiEndpoints.invoices.update(invoiceId), payload);
  return data;
}

export async function deleteInvoice(invoiceId: string): Promise<InvoiceResponse> {
  const { data } = await api.delete(apiEndpoints.invoices.delete(invoiceId));
  return data;
}

export async function sendInvoice(invoiceId: string): Promise<InvoiceResponse> {
  const { data } = await api.post(apiEndpoints.invoices.send(invoiceId));
  return data;
}

export async function markInvoicePaid(invoiceId: string): Promise<InvoiceResponse> {
  const { data } = await api.post(apiEndpoints.invoices.markPaid(invoiceId));
  return data;
}

export async function voidInvoice(invoiceId: string): Promise<InvoiceResponse> {
  const { data } = await api.post(apiEndpoints.invoices.void(invoiceId));
  return data;
}
