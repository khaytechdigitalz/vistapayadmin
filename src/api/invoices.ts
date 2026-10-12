import { apiClient } from "@/lib/axios";

export interface InvoiceItem {
  id?: number | string;
  invoice_id?: number;
  description: string;
  qty: number;
  rate: number;
  amount?: number;
}

export interface InvoiceUser {
  id: number;
  name: string;
  email: string;
}

export interface Invoice {
  id: number;
  user_id: number;
  number: string;
  client: string;
  client_email?: string | null;
  client_address?: string | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  notes?: string | null;
  items: InvoiceItem[];
  user?: InvoiceUser;
  created_at: string;
  updated_at: string;
}

export interface InvoiceMetrics {
  total_invoices: number;
  total_paid: number;
  total_pending: number;
  paid_count: number;
  overdue_count: number;
}

export interface InvoicesAdminResponse {
  status: boolean;
  message: string;
  data: {
    invoices: {
      current_page: number;
      data: Invoice[];
      last_page: number;
      total: number;
    } | Invoice[];
    metrics: InvoiceMetrics;
  };
}

export async function fetchInvoices(params?: { search?: string; status?: string }): Promise<InvoicesAdminResponse> {
  const res = await apiClient.get("/invoices", { params });
  return res.data;
}

export async function fetchInvoiceById(id: string | number): Promise<{ status: boolean; data: Invoice }> {
  const res = await apiClient.get(`/invoices/${id}`);
  return res.data;
}

export async function updateInvoice(
  id: string | number,
  payload: Partial<Invoice>
): Promise<{ status: boolean; data: Invoice }> {
  const res = await apiClient.put(`/invoices/${id}`, payload);
  return res.data;
}

export async function deleteInvoice(id: string | number): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.delete(`/invoices/${id}`);
  return res.data;
}