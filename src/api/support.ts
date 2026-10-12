import { apiClient } from "@/lib/axios";

export interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  body: string;
  time: string;
}

export interface SupportTicketItem {
  id: string;
  ticket_no: string;
  subject: string;
  category: string;
  status: "Open" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdAt: string;
  lastUpdate: string;
  messages?: TicketMessage[];
}

export async function fetchSupportTickets(): Promise<{ status: boolean; data: SupportTicketItem[] }> {
  const res = await apiClient.get("/vservices/support/tickets");
  return res.data;
}

export async function createSupportTicket(subject: string, category: string, message: string): Promise<{ status: boolean; message: string; data: SupportTicketItem }> {
  const res = await apiClient.post("/vservices/support/tickets", { subject, category, message });
  return res.data;
}

export async function fetchTicketDetails(id: string): Promise<{ status: boolean; data: SupportTicketItem }> {
  const res = await apiClient.get(`/vservices/support/tickets/${id}`);
  return res.data;
}

export async function sendTicketReply(id: string, message: string): Promise<{ status: boolean; message: string; data: TicketMessage }> {
  const res = await apiClient.post(`/vservices/support/tickets/${id}/reply`, { message });
  return res.data;
}

export async function markTicketAsResolved(id: string): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post(`/vservices/support/tickets/${id}/resolve`);
  return res.data;
}