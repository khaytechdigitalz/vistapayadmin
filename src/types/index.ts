export type TxStatus = "Success" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  invoiceId: string;
  amount: number;
  status: TxStatus;
  icon: string;
  color: string;
}

export interface Card {
  id: string;
  brand: "Mastercard" | "Visa";
  tier: string;
  last4: string;
  fullNumber: string;
  expiry: string;
  balance: number;
  gradientFrom: string;
  gradientTo: string;
}

export interface CardTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: TxStatus;
}

export interface VirtualCard {
  id: string;
  label: string;
  type: "Naira Card" | "Dollar Card" | "Visa" | "Mastercard";
  number: string;
  last4: string;
  cvv: string;
  expiry: string;
  balance: number;
  status: "Active" | "Frozen" | "Blocked";
  gradientFrom: string;
  gradientTo: string;
  transactions: CardTransaction[];
}

export interface Recipient {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  bank: string;
  accountNumber: string;
  favorite: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  clientEmail?: string;
  clientAddress?: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  issueDate: string;
  dueDate: string;
  items?: InvoiceItem[];
  notes?: string;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "agent";
  senderName: string;
  body: string;
  time: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  lastUpdate: string;
  messages?: TicketMessage[];
}

export interface ApiKey {
  id: string;
  label: string;
  keyPreview: string;
  environment: "Live" | "Test";
  createdAt: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}

export interface User {
  id: string;
  name: string;
  email: string;
  hasTransactionPin: boolean;
  phone: string;
  kycStatus: "Unverified" | "Pending" | "Verified";
  avatarInitial: string;
  google2fa_enabled: boolean;
}
