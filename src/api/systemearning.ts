import { apiClient } from "@/lib/axios";

export interface EarningsMetrics {
  total_fees_earned: number;
  total_volume: number;
  total_successful: number;
}

export interface ServiceBreakdownItem {
  remark: string;
  total_fees: number;
  total_volume: number;
  count: number;
}

export interface TransactionAuditItem {
  id: number;
  reference: string;
  type: string;
  amount: number;
  charge: number;
  status: string;
  remark: string;
  created_at: string;
}

export interface EarningsResponse {
  status: boolean;
  message: string;
  data: {
    metrics: EarningsMetrics;
    breakdown_by_service: ServiceBreakdownItem[];
    audit_logs: {
      data: TransactionAuditItem[];
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  };
}

/**
 * Fetch system earnings metrics, fee audits, and filtered transaction logs.
 */
export async function fetchSystemEarnings(params?: {
  from_date?: string;
  to_date?: string;
  remark?: string;
  search?: string;
  page?: number;
}): Promise<EarningsResponse> {
  const res = await apiClient.get("/system/earnings", { params });
  return res.data;
}