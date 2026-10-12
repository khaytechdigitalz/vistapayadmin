import { apiClient } from "@/lib/axios";

export interface UserTransferRecord {
  id: number;
  user_id: number;
  amount: string;
  charge: string;
  balance_before: string;
  balance_after: string;
  type: "credit" | "debit";
  reference: string;
  details: any;
  remark: string;
  service_provider: string;
  status: "success" | "pending" | "failed";
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_email?: string;
  beneficiary_name?: string;
  beneficiary_email?: string;
}

export interface UserTransferHistoryResponse {
  status: boolean;
  message: string;
  data: {
    data: UserTransferRecord[];
    current_page: number;
    last_page: number;
    total: number;
  } | UserTransferRecord[];
}

/**
 * Fetch all internal peer-to-peer user transfers for admin auditing.
 */
export async function fetchHistory(params?: { status?: string; search?: string; page?: number }) {
  const response = await apiClient.get<UserTransferHistoryResponse>("/user-transfers", {
    params,
  });
  return response.data;
}