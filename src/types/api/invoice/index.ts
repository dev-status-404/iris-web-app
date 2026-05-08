import { GenericResponse } from "@/types/api";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_amount: number;
  amount?: number;
};

export type Invoice = {
  _id: string;
  user_id: string;
  integration_id?: string | null;
  customer: {
    name?: string;
    email: string;
  };
  items: InvoiceLineItem[];
  currency: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  status: "draft" | "sent" | "paid" | "void";
  due_date?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInvoicePayload = Omit<
  Partial<Invoice>,
  "_id" | "user_id" | "createdAt" | "updatedAt"
> & {
  customer: Invoice["customer"];
  items: InvoiceLineItem[];
};

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export type InvoiceResponse = GenericResponse<Invoice>;
export type InvoicesResponse = GenericResponse<Invoice[]>;
