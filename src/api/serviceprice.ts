import { apiClient } from "@/lib/axios";

export interface ServicePlan {
  id: number;
  type: string;
  provider: string;
  variation_code: string;
  name: string;
  variation_amount: number;
  api_amount: number;
  fixed_price: number;
  api_price: number;
  status: string | number;
  api_status: string | number;
  updated_at: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginatedServicePlansResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: ServicePlan[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

/**
 * Fetch paginated service plans with optional filters and page number
 */
export async function fetchServicePlans(params?: {
  search?: string;
  type?: string;
  status?: string;
  api_status?: string;
  provider?: string;
  name?: string;
  variation_code?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedServicePlansResponse> {
  // Ensure correct admin prefix matching your backend route group
  const res = await apiClient.get("/pricing/bills", { params });
  return res.data;
}

/**
 * Update plan details
 */
export async function updateServicePlan(
  id: number,
  payload: {
    name?: string;
    variation_code?: string;
    fixed_price?: number;
    api_price?: number;
  }
): Promise<{ status: boolean; message: string; data: ServicePlan }> {
  const res = await apiClient.put(`/pricing/bills/${id}`, payload);
  return res.data;
}

/**
 * Toggle client-facing plan status
 */
export async function togglePlanStatus(
  id: number,
  status: string | number
): Promise<{ status: boolean; message: string; data: ServicePlan }> {
  const res = await apiClient.patch(`/pricing/bills/${id}/status`, { status });
  return res.data;
}

/**
 * Toggle API integration status
 */
export async function toggleApiStatus(
  id: number,
  api_status: string | number
): Promise<{ status: boolean; message: string; data: ServicePlan }> {
  const res = await apiClient.patch(`/pricing/bills/${id}/api-status`, { api_status });
  return res.data;
}