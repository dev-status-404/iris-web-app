import { GenericResponse } from "@/types/api";

export type PhoneNumber = {
  _id: string;
  userId: string | null;
  number: string;
  telnyxNumberId: string | null;
  status: "active" | "released" | "pool";
  provider: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PhoneNumberListResponse = GenericResponse<{
  numbers: PhoneNumber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}>;

export type PurchaseNumberPayload = {
  phone_number: string; // E.164
};
