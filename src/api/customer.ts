import { apiClient } from "@/lib/axios";

export interface CustomerWallet {
  id: number;
  user_id: number;
  balance: number;
  ledger_balance: number;
}

export interface CustomerKyc {
  id: number;
  user_id: number;
  current_level: number;
  status: "pending" | "approved" | "rejected";
}

export interface VirtualCardItem {
  id: number;
  user_id: number;
  masked_card: string;
  status: "active" | "frozen" | "terminated";
  balance: number;
}

export interface CustomerTransaction {
  id: number;
  reference: string;
  amount: number;
  charge: number;
  type: "debit" | "credit";
  service_provider?: string;
  remark?: string;
  balance_before: number;
  balance_after: number;
  status: "success" | "pending" | "failed";
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "disabled" | "blocked";
  created_at: string;
  wallet?: CustomerWallet;
  kyc?: CustomerKyc;
  virtualcards?: VirtualCardItem[];
}

export interface CustomerMetrics {
  total_customers: number;
  active_customers: number;
  blocked_count: number;
  total_wallets: number;
}

export interface CustomersListResponse {
  status: boolean;
  message: string;
  data: {
    customers: {
      current_page: number;
      data: Customer[];
      last_page: number;
      total: number;
    } | Customer[];
    metrics: CustomerMetrics;
  };
}

export interface CustomerDetailResponse {
  status: boolean;
  message: string;
  data: {
    customer: Customer;
    transactions: {
      current_page: number;
      data: CustomerTransaction[];
      last_page: number;
      total: number;
    };
  };
}

/**
 * Fetch paginated customers with filters and metrics
 */
export async function fetchCustomers(params?: {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<CustomersListResponse> {
  const res = await apiClient.get("/customers", { params });
  return res.data;
}

/**
 * Fetch single customer details, wallet, cards, and paginated transactions
 */
export async function fetchCustomerById(
  id: string | number,
  params?: { search?: string; status?: string; page?: number }
): Promise<CustomerDetailResponse> {
  const res = await apiClient.get(`/customers/${id}`, { params });
  return res.data;
}

/**
 * Update customer status (active, disabled, blocked)
 */
export async function updateCustomerStatus(
  id: string | number,
  status: "active" | "disabled" | "blocked"
): Promise<{ status: boolean; message: string; data: Customer }> {
  const res = await apiClient.patch(`/customers/${id}/status`, { status });
  return res.data;
}

/**
 * Adjust customer wallet balance (credit or debit)
 */
export async function adjustCustomerWallet(
  id: string | number,
  payload: { action: "credit" | "debit"; amount: number; remark: string }
): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post(`/customers/${id}/wallet-adjust`, payload);
  return res.data;
}