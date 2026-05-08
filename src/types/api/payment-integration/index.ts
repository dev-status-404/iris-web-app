import { GenericResponse } from "@/types/api";

export type PaymentProvider = "stripe" | "paypal";

export type PaymentIntegration = {
  _id: string;
  user_id: string;
  provider: PaymentProvider;
  account_name?: string;
  status: "active" | "inactive" | "error";
  is_default?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ConnectPaymentIntegrationPayload = {
  provider: PaymentProvider;
  account_name?: string;
  credentials: Record<string, unknown>;
  is_default?: boolean;
};

export type UpdatePaymentIntegrationPayload =
  Partial<ConnectPaymentIntegrationPayload> & {
    status?: PaymentIntegration["status"];
  };

export type PaymentIntegrationResponse = GenericResponse<PaymentIntegration>;
export type PaymentIntegrationsResponse = GenericResponse<PaymentIntegration[]>;
