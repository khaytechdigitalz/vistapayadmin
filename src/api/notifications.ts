import { apiClient } from "@/lib/axios";

export interface NotificationItem {
  id: number;
  user_id: number;
  subject: string;
  details: string;
  type: "transfer" | "bill" | "security" | "alert" | string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotifications {
  current_page: number;
  data: NotificationItem[];
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

export async function fetchNotifications(page = 1): Promise<{ status: boolean; data: PaginatedNotifications }> {
  const res = await apiClient.get(`/vservices/notifications?page=${page}`);
  return res.data;
}

export async function markNotificationAsRead(id: number): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post(`/vservices/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead(): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post("/vservices/notifications/mark-all-read");
  return res.data;
}