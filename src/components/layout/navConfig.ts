import { moneyFlow7 } from "@/data/mockData";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  User,
  FileText,
  Receipt,
  History,
  BarChart3,
  LifeBuoy,
  Settings,
  ShieldCheck,
  KeyRound,
  BadgeCheck,
  Link,
  Landmark,
  CreditCard,
  GiftIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  { label: "Bank Transfers", path: "/app/bank/transfer", icon: Landmark },
  { label: "P2P Transfers", path: "/app/p2p/transfer", icon: ArrowLeftRight },
  { label: "Deposits", path: "/app/deposit", icon: Wallet },
  { label: "Payment Link", path: "/app/paymentlink", icon: Link },
  { label: "Giftcards ", path: "/app/giftcards", icon: GiftIcon },
  { label: "Virtual Cards", path: "/app/cards", icon: CreditCard },
  { label: "Transactions", path: "/app/transactions", icon: History },
  { label: "Bills Payment", path: "/app/bills", icon: Receipt },
  { label: "Invoices", path: "/app/invoices", icon: FileText },
  { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
];

export const secondaryNav: NavItem[] = [
  { label: "Account Settings", path: "/app/settings/account", icon: User },
  { label: "Security Settings", path: "/app/settings/security", icon: ShieldCheck },
  { label: "API Settings", path: "/app/settings/api", icon: KeyRound },
  { label: "Identity Verification", path: "/app/verification", icon: BadgeCheck },
];

export const tertiaryNav: NavItem[] = [
  { label: "System Settings", path: "/app/system/settings", icon: Settings },
];

export const footerNav: NavItem[] = [
  { label: "Support Ticket", path: "/app/support", icon: LifeBuoy },
];