import { apiClient } from "@/lib/axios";

export interface VirtualCard {
  id: number;
  user_id: number;
  card_id: string;
  account_id: string;
  card_name: string;
  card_number?: string;
  masked_card: string;
  card_type: string;
  currency: string;
  expiration: string;
  balance: number;
  status: "active" | "frozen" | "terminated";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CardsAdminResponse {
  status: boolean;
  message: string;
  data: {
    cards: {
      data: VirtualCard[];
      current_page: number;
      last_page: number;
      total: number;
    } | VirtualCard[];
    metrics: {
      active_count: number;
      frozen_count: number;
      terminated_count: number;
    };
  };
}

export interface CardTransaction {
  id: number;
  user_id: number;
  virtual_card_id: number;
  card_id: string;
  amount: number;
  charge: number;
  type: "funding" | "withdrawal" | "purchase" | "refund";
  status: "success" | "pending" | "failed";
  reference: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Fetch all virtual cards for admin oversight
export const fetchAllCards = async (params?: { search?: string; status?: string; page?: number }) => {
  const res = await apiClient.get<CardsAdminResponse>("/cards", { params });
  return res.data;
};

// Fetch specific card details
export const fetchCardDetails = async (id: string | number) => {
  const res = await apiClient.get(`/cards/${id}`);
  return res.data;
};

// Fetch card transactions
export const fetchCardTransactions = async (id: string | number) => {
  const res = await apiClient.get(`/cards/${id}/transactions`);
  return res.data;
};

 

// Freeze Card
export const freezeCard = async (id: string | number) => {
  const res = await apiClient.post(`/cards/${id}/freeze`);
  return res.data;
};

// Unfreeze Card
export const unfreezeCard = async (id: string | number) => {
  const res = await apiClient.post(`/cards/${id}/unfreeze`);
  return res.data;
};

// Terminate Card
export const terminateCard = async (id: string | number) => {
  const res = await apiClient.post(`/cards/${id}/terminate`);
  return res.data;
};