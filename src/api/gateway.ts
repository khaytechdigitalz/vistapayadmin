import { apiClient } from "@/lib/axios";

export interface PaymentGateway {
  id: number;
  code: string;
  name: string;
  currency: string;
  min_amount: number;
  max_amount: number;
  fixed_charge: number;
  percent_charge: number;
  credentials: Record<string, string> | null;
  instructions: string | null;
  is_active: boolean | number;
  updated_at: string;
}

export interface GatewaysResponse {
  status: boolean;
  message: string;
  data: PaymentGateway[];
}

/**
 * Fetch all payment gateways
 */
export async function fetchGateways(): Promise<GatewaysResponse> {
  const res = await apiClient.get("/gateways");
  return res.data;
}

/**
 * Update payment gateway configuration
 */
export async function updateGateway(
  id: number,
  payload: {
    name: string;
    currency: string;
    min_amount: number;
    max_amount: number;
    fixed_charge: number;
    percent_charge: number;
    credentials?: Record<string, string> | null;
    instructions?: string | null;
  }
): Promise<{ status: boolean; message: string; data: PaymentGateway }> {
  const res = await apiClient.put(`/gateways/${id}`, payload);
  return res.data;
}

/**
 * Toggle payment gateway active status
 */
export async function toggleGatewayStatus(
  id: number,
  is_active: boolean | number
): Promise<{ status: boolean; message: string; data: PaymentGateway }> {
  const res = await apiClient.patch(`/gateways/${id}/status`, { is_active });
  return res.data;
}