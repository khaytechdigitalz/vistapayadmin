import { apiClient } from "@/lib/axios";

export interface KycStatusResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    current_level: number;
    status: "pending" | "approved" | "rejected";
    rejection_reason?: string;
    id_type?: string;
    id_number?: string;
    id_card_front?: string;
    id_card_back?: string;
    level_1_status: "not_submitted" | "pending" | "approved" | "rejected";
    address_type?: string;
    utility_bill_type?: string;
    address_document?: string;
    level_2_status: "not_submitted" | "pending" | "approved" | "rejected";
    liveness_photo?: string;
    level_3_status: "not_submitted" | "pending" | "approved" | "rejected";
    created_at: string;
    updated_at: string;
  };
}

export const getKycStatus = async (): Promise<KycStatusResponse> => {
  const response = await apiClient.get("/kyc/status");
  return response.data;
};

export const submitLevelOne = async (formData: FormData) => {
  const response = await apiClient.post("/kyc/level-1", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const submitLevelTwo = async (formData: FormData) => {
  const response = await apiClient.post("/kyc/level-2", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const submitLevelThree = async (formData: FormData) => {
  const response = await apiClient.post("/kyc/level-3", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};