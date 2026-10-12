import { apiClient } from "@/lib/axios";

export interface TransactionUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  reference: string;
  amount: number;
  charge: number;
  type: "debit" | "credit";
  service_provider?: string;
  remark?: string;
  balance_before: number;
  balance_after: number;
  status: "success" | "pending" | "failed";
  details?: Record<string, any> | string;
  api_response?: Record<string, any> | string;
  created_at: string;
  updated_at: string;
  user?: TransactionUser;
}

export interface TransactionQueryParams {
  search?: string;
  type?: "debit" | "credit";
  status?: "pending" | "success" | "failed";
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  page?: number;
  per_page?: number;
}

export interface TransactionsMetrics {
  total_volume: number;
  total_amount: number;
  successful: number;
  failed: number;
  pending: number;
}

export interface PaginatedTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: {
      current_page: number;
      data: Transaction[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      next_page_url?: string;
      path: string;
      per_page: number;
      prev_page_url?: string;
      to: number;
      total: number;
    };
    metrics: TransactionsMetrics;
  };
}

export interface BillPaymentAnalytics {
  timeline: Array<{
    date: string;
    total_amount: number;
    count: number;
  }>;
  remarks: Array<{
    remark: string;
    total_amount: number;
    count: number;
  }>;
}

/**
 * Fetch paginated transactions list for admin auditing
 */
export const fetchTransactions = async (
  params?: TransactionQueryParams
): Promise<PaginatedTransactionsResponse> => {
  const res = await apiClient.get("/transactions", { params });
  return res.data;
};
 
export type BillPaymentItem = Transaction;
export type BillPaymentQueryParams = TransactionQueryParams;

export interface BillPaymentMetrics {
  total_volume: number;
  total_amount: number;
  successful: number;
  failed: number;
  pending: number;
}

export interface BillPaymentAnalytics {
  timeline: Array<{
    date: string;
    total_amount: number;
    count: number;
  }>;
  remarks: Array<{
    remark: string;
    total_amount: number;
    count: number;
  }>;
}

export interface BillPaymentsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: {
      current_page: number;
      data: BillPaymentItem[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    } | BillPaymentItem[];
    metrics?: BillPaymentMetrics;
    analytics: BillPaymentAnalytics;
  };
}

/**
 * Fetch bill payment specific transactions and analytics for admin
 */
export const fetchBillPayments = async (
  params?: BillPaymentQueryParams
): Promise<BillPaymentsResponse> => {
  const res = await apiClient.get("/admin/transactions/bills/payment", { params });
  return res.data;
};
/**
 * Fetch single transaction details by reference or ID
 */
export const fetchTransactionByIdentifier = async (
  identifier: string | number
): Promise<{ status: boolean; message: string; data: Transaction }> => {
  const res = await apiClient.get(`/transactions/${identifier}`);
  return res.data;
};