import { apiClient } from "@/lib/axios";

export interface TicketUser {
  id: number | null;
  name: string;
  email: string;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  body: string;
  time: string;
  created_at?: string;
}

export interface AdminSupportTicketItem {
  id: string;
  ticket_no: string;
  user: TicketUser;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Answered" | "Resolved" | "Closed";
  priority: string;
  createdAt: string;
  lastUpdate: string;
  messages?: TicketMessage[];
}

/**
 * Fetch all customer support tickets for admin
 */
export async function fetchAdminSupportTickets(params?: {
  status?: string;
  search?: string;
}): Promise<{ status: boolean; message: string; data: AdminSupportTicketItem[] }> {
  const res = await apiClient.get("/support/tickets", { params });
  return res.data;
}

/**
 * Fetch details and thread for a single ticket
 */
export async function fetchAdminTicketDetails(
  id: string
): Promise<{ status: boolean; data: AdminSupportTicketItem }> {
  const res = await apiClient.get(`/support/tickets/${id}`);
  return res.data;
}

/**
 * Admin reply to a support ticket
 */
export async function sendAdminTicketReply(
  id: string,
  message: string
): Promise<{ status: boolean; message: string; data: TicketMessage }> {
  const res = await apiClient.post(`/support/tickets/${id}/reply`, { message });
  return res.data;
}

/**
 * Update support ticket status
 */
export async function updateAdminTicketStatus(
  id: string,
  status: string
): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.patch(`/support/tickets/${id}/status`, { status });
  return res.data;
}

/**
 * Mark ticket as resolved
 */
export async function markAdminTicketAsResolved(
  id: string
): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.patch(`/support/tickets/${id}/resolve`);
  return res.data;
}