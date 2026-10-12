import { apiClient } from "@/lib/axios";

export interface PaymentLink {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  description?: string;
  amount: number;
  is_active: boolean;
  successful_payments_count?: number;
  total_raised?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentLinkPaymentItem {
  id: number;
  payment_link_id: number;
  reference: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  account_number?: string;
  bank_name?: string;
  account_name?: string;
  status: "pending" | "success" | "failed";
  paid_at?: string;
  created_at: string;
}

export interface PaymentLinkDetailsResponse {
  payment_link: PaymentLink;
  stats: {
    total_raised: number;
    total_attempts: number;
    successful_count: number;
    failed_count: number;
    pending_count: number;
  };
  payments: {
    current_page: number;
    data: PaymentLinkPaymentItem[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaymentLinksAdminResponse {
  status: boolean;
  message: string;
  data: {
    payment_links: {
      current_page: number;
      data: PaymentLink[];
      last_page: number;
      per_page: number;
      total: number;
    } | PaymentLink[];
    metrics: {
      active_count: number;
      inactive_count: number;
      active_links_raised: number;
    };
  };
}

// Admin Payment Link Endpoints
export const fetchPaymentLinks = async (params?: { search?: string; is_active?: boolean; page?: number; per_page?: number }) => {
  const res = await apiClient.get<PaymentLinksAdminResponse>("/payment-links", { params });
  return res.data;
};

export const fetchPaymentLinkDetails = async (id: string | number, params?: { page?: number; per_page?: number }) => {
  const res = await apiClient.get(`/payment-links/${id}`, { params });
  return res.data;
};

export const togglePaymentLinkStatus = async (id: string | number) => {
  const res = await apiClient.patch(`/payment-links/${id}/toggle`);
  return res.data;
};