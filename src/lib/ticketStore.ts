import { supportTickets as builtInTickets } from "@/data/mockData";
import type { SupportTicket, TicketMessage } from "@/types";

const KEY = "vistapay_tickets_state";

interface StoredState {
  tickets: SupportTicket[];
}

function readState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    /* ignore */
  }
  return { tickets: builtInTickets };
}

function writeState(state: StoredState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getAllTickets(): SupportTicket[] {
  return readState().tickets;
}

export function getTicketById(id: string): SupportTicket | undefined {
  return readState().tickets.find((t) => t.id === id);
}

export function addTicket(ticket: SupportTicket) {
  const state = readState();
  state.tickets = [ticket, ...state.tickets];
  writeState(state);
}

export function appendMessage(ticketId: string, message: TicketMessage) {
  const state = readState();
  state.tickets = state.tickets.map((t) =>
    t.id === ticketId
      ? { ...t, messages: [...(t.messages ?? []), message], lastUpdate: "Just now", status: t.status === "Resolved" ? "Open" : t.status }
      : t
  );
  writeState(state);
}

export function updateTicketStatus(ticketId: string, status: SupportTicket["status"]) {
  const state = readState();
  state.tickets = state.tickets.map((t) => (t.id === ticketId ? { ...t, status, lastUpdate: "Just now" } : t));
  writeState(state);
}
