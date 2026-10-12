import { apiClient } from "@/lib/axios";

export interface DepositRecord {
  id: number;
  user_id: number;
  amount: string;
  charge: string;
  reference: string;
  gateway: string;
  proof_file: string;
  status: "success" | "pending" | "failed";
  details: string | any;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface DepositHistoryResponse {
  status: boolean;
  message: string;
  data: {
    deposits: {
      data: DepositRecord[];
      current_page: number;
      last_page: number;
      total: number;
    } | DepositRecord[];
    status_summary: Record<string, { total_count: number; total_amount: number }>;
  };
}

/**
 * Fetch all deposit records with summary stats for admin.
 */
export async function fetchDepositHistory(params?: { status?: string; search?: string; page?: number }) {
  const response = await apiClient.get<DepositHistoryResponse>("/deposits/history", {
    params,
  });
  return response.data;
}

/**
 * Fetch details for a specific deposit.
 */
export async function fetchDepositDetails(depositId: number) {
  const response = await apiClient.post<{ status: boolean; message: string; data: DepositRecord }>(
    "/deposits/detaails",
    { deposit_id: depositId }
  );
  return response.data;
}

/**
 * Approve a pending deposit and credit wallet.
 */
export async function approveDeposit(depositId: number) {
  const response = await apiClient.post<{ status: boolean; message: string; data: DepositRecord }>(
    "/deposits/approve",
    { deposit_id: depositId }
  );
  return response.data;
}

/**
 * Reject a pending deposit.
 */
export async function rejectDeposit(depositId: number, reason?: string) {
  const response = await apiClient.post<{ status: boolean; message: string; data: DepositRecord }>(
    "/deposits/reject",
    { deposit_id: depositId, reason }
  );
  return response.data;
}