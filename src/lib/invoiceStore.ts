import { invoices as builtInInvoices } from "@/data/mockData";
import type { Invoice } from "@/types";

const KEY = "vistapay_custom_invoices";

function readCustom(): Invoice[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}

function writeCustom(list: Invoice[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getAllInvoices(): Invoice[] {
  return [...readCustom(), ...builtInInvoices];
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getAllInvoices().find((inv) => inv.id === id);
}

export function addInvoice(invoice: Invoice) {
  const current = readCustom();
  writeCustom([invoice, ...current]);
}
