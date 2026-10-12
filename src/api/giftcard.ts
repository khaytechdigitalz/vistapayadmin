import { apiClient } from "@/lib/axios";

export interface Giftcard {
  id: number;
  name: string;
  slug: string;
  currency?: string;
  rate: number;
  buy_rate: number;
  sell_rate: number;
  image_url?: string;
  description?: string;
  status: boolean; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
}

export interface GiftcardTrade {
  id: number;
  user_id: number;
  giftcard_id: number;
  reference: string;
  type: "buy" | "sell";
  card_type?: string;
  amount: number;
  rate: number;
  total_payable: number;
  card_number?: string;
  card_image_front?: string;
  card_image_back?: string;
  status: "pending" | "processing" | "success" | "failed" | "cancelled";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  adminNotes: string;
  giftcard?: Giftcard;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface GiftcardsResponse {
  status: boolean;
  message: string;
  data: {
    giftcards: {
      data: Giftcard[];
      current_page: number;
      last_page: number;
      total: number;
    } | Giftcard[];
    metrics: {
      active_count: number;
      inactive_count: number;
    };
  };
}

// Fetch all giftcards (Admin)
export const fetchGiftcards = async (params?: { search?: string; status?: boolean; page?: number }) => {
  const res = await apiClient.get<GiftcardsResponse>("/giftcards", { params });
  return res.data;
};

// Create a new giftcard
export const createGiftcard = async (formData: FormData) => {
  const res = await apiClient.post("/giftcards", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update an existing giftcard
export const updateGiftcard = async (id: number, formData: FormData) => {
  // Use POST with _method=PUT or direct PUT if multipart is supported by backend
  formData.append("_method", "PUT");
  const res = await apiClient.post(`/giftcards/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Toggle giftcard active/inactive status
export const toggleGiftcardStatus = async (id: number) => {
  const res = await apiClient.patch(`/giftcards/${id}/toggle`);
  return res.data;
};

// Fetch giftcard trade history
export const fetchGiftcardTrades = async (params?: { status?: string; type?: string; search?: string; page?: number }) => {
  const res = await apiClient.get("/giftcards/trades/history", { params });
  return res.data;
};

// Approve trade and credit user wallet
export const approveGiftcardTrade = async (tradeId: number) => {
  const res = await apiClient.post("/giftcards/trades/approve", { trade_id: tradeId });
  return res.data;
};

// Reject trade
export const rejectGiftcardTrade = async (tradeId: number, reason?: string) => {
  const res = await apiClient.post("/giftcards/trades/reject", { trade_id: tradeId, reason });
  return res.data;
};

// Delete giftcard
export const deleteGiftcard = async (id: number) => {
  const res = await apiClient.delete(`/giftcards/${id}/delete`);
  return res.data;
};