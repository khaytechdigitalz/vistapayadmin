import { apiClient } from "@/lib/axios";

export interface KycUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface KycSubmission {
  id: number;
  user_id: number;
  current_level: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  id_type?: string;
  id_number?: string;
  id_card_front?: string;
  id_card_back?: string;
  level_1_status: "not_submitted" | "pending" | "approved" | "rejected";
  address_type?: string;
  address_document?: string;
  utility_bill_type?: string;
  level_2_status: "not_submitted" | "pending" | "approved" | "rejected";
  liveness_photo?: string;
  level_3_status: "not_submitted" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user?: KycUser;
}

export interface KycMetrics {
  total_submissions: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}

export interface KycHistoryResponse {
  status: boolean;
  message: string;
  data: {
    submissions: {
      current_page: number;
      data: KycSubmission[];
      last_page: number;
      total: number;
    } | KycSubmission[];
    metrics: KycMetrics;
  };
}

/**
 * Fetch all admin KYC submissions with filter options and metrics
 */
export const fetchKycHistory = async (params?: {
  status?: string;
  level?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<KycHistoryResponse> => {
  const res = await apiClient.get("/kyc/history", { params });
  return res.data;
};

/**
 * Fetch detailed information for a single KYC submission
 */
export const fetchKycDetails = async (id: number | string): Promise<{ status: boolean; data: KycSubmission }> => {
  const res = await apiClient.post(`/kyc/details/${id}`);
  return res.data;
};

/**
 * Approve specific KYC level or overall status
 */
export const approveKyc = async (payload: { kyc_id: number; level?: number }): Promise<{ status: boolean; message: string; data: KycSubmission }> => {
  const res = await apiClient.post("/kyc/approve", payload);
  return res.data;
};

/**
 * Reject specific KYC level or overall status with a reason
 */
export const rejectKyc = async (payload: { kyc_id: number; level?: number; rejection_reason: string }): Promise<{ status: boolean; message: string; data: KycSubmission }> => {
  const res = await apiClient.post("/kyc/reject", payload);
  return res.data;
};