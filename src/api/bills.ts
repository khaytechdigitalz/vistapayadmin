import { apiClient } from "@/lib/axios";

export interface BillPaymentItem {
  id: number;
  user_id: number;
  reference: string;
  remark: string;
  amount: number;
  charge: number;
  balance_before?: number;
  balance_after?: number;
  service_provider?: string;
  created_at: string;
  updated_at?: string;
  status: "success" | "pending" | "failed";
  details: Record<string, any> | null;
}

export interface BillPaymentQueryParams {
  search?: string;
  status?: "pending" | "success" | "failed";
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export interface TimelineAnalyticsItem {
  date: string;
  total_amount: number;
  count: number;
}

export interface RemarkAnalyticsItem {
  remark: string;
  total_amount: number;
  count: number;
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
    };
    analytics: {
      timeline: TimelineAnalyticsItem[];
      remarks: RemarkAnalyticsItem[];
    };
  };
}

/**
 * Fetch bill payment transactions with optional filters and analytics data
 */
export const fetchBillPayments = async (
  params?: BillPaymentQueryParams
): Promise<BillPaymentsResponse> => {
  const response = await apiClient.get<BillPaymentsResponse>(
    "transactions/bills/payment",
    { params }
  );
  return response.data;
};