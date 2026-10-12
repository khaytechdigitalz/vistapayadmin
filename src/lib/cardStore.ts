import type { VirtualCard, CardTransaction } from "@/types";

const KEY = "vistapay_virtual_cards";

function seedCards(): VirtualCard[] {
  return [
    {
      id: "vc1",
      label: "Everyday Spending",
      type: "Naira Card",
      number: "5399 8312 4471 0092",
      last4: "0092",
      cvv: "482",
      expiry: "08/28",
      balance: 45200,
      status: "Active",
      gradientFrom: "#0E3B39",
      gradientTo: "#0A2E2C",
      transactions: [
        { id: "ct1", date: "Sep 05, 2026", description: "Netflix Subscription", amount: 4500, type: "debit", status: "Success" },
        { id: "ct2", date: "Sep 02, 2026", description: "Card Funding", amount: 30000, type: "credit", status: "Success" },
        { id: "ct3", date: "Aug 29, 2026", description: "Spotify Premium", amount: 1900, type: "debit", status: "Success" },
      ],
    },
    {
      id: "vc2",
      label: "Online Shopping",
      type: "Dollar Card",
      number: "4539 4512 8890 2214",
      last4: "2214",
      cvv: "731",
      expiry: "03/29",
      balance: 120.5,
      status: "Active",
      gradientFrom: "#134B48",
      gradientTo: "#0A2E2C",
      transactions: [
        { id: "ct1", date: "Sep 01, 2026", description: "Amazon.com", amount: 45.99, type: "debit", status: "Success" },
        { id: "ct2", date: "Aug 20, 2026", description: "Card Funding", amount: 200, type: "credit", status: "Success" },
      ],
    },
  ];
}

function readCards(): VirtualCard[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as VirtualCard[];
  } catch {
    /* ignore */
  }
  const seeded = seedCards();
  writeCards(seeded);
  return seeded;
}

function writeCards(cards: VirtualCard[]) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function getAllCards(): VirtualCard[] {
  return readCards();
}

export function getCardById(id: string): VirtualCard | undefined {
  return readCards().find((c) => c.id === id);
}

export function addCard(card: VirtualCard) {
  const cards = readCards();
  writeCards([card, ...cards]);
}

export function setCardStatus(id: string, status: VirtualCard["status"]) {
  const cards = readCards().map((c) => (c.id === id ? { ...c, status } : c));
  writeCards(cards);
}

export function fundCard(id: string, amount: number): VirtualCard | undefined {
  const cards = readCards();
  let updated: VirtualCard | undefined;
  const next = cards.map((c) => {
    if (c.id !== id) return c;
    const transaction: CardTransaction = {
      id: `ct${Date.now()}`,
      date: "Just now",
      description: "Card Funding",
      amount,
      type: "credit",
      status: "Success",
    };
    updated = { ...c, balance: c.balance + amount, transactions: [transaction, ...c.transactions] };
    return updated;
  });
  writeCards(next);
  return updated;
}

function randomDigits(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function generateCardNumber() {
  return `${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)}`;
}
