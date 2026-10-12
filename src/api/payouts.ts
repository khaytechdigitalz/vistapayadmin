import { apiClient } from "@/lib/axios";

export interface Beneficiary {
  id: number;
  user_id: number;
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PayoutTransaction {
  id: number;
  user_id: number;
  amount: string;
  charge: string;
  balance_before: string;
  balance_after: string;
  type: "credit" | "debit";
  reference: string;
  details: string | any;
  remark: string;
  service_provider: string;
  status: "success" | "pending" | "failed";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// Fetch Payout/Transfer History (Admin endpoint)
export async function fetchPayoutHistory(params?: { status?: string; search?: string; page?: number }) {
  const response = await apiClient.get<{ status: boolean; data: { data: PayoutTransaction[] } | PayoutTransaction[] }>(
    "/payout/history",
    { params }
  );
  return response.data;
}

// Fetch Saved Beneficiaries
export async function fetchBeneficiaries() {
  const response = await apiClient.get<{ status: boolean; data: Beneficiary[] }>("/payout/beneficiaries");
  return response.data;
}

// Delete Beneficiary
export async function deleteBeneficiary(id: number) {
  const response = await apiClient.delete(`/payout/beneficiaries/${id}`);
  return response.data;
}