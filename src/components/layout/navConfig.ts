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
  BadgeCheck,
  Link,
  Users,
  Landmark,
  CreditCard,
  GiftIcon,
  Calculator,
  WalletCards,
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
  { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
];

export const wallettNav: NavItem[] = [
  { label: "Bank Transfers", path: "/app/bank/transfer", icon: Landmark },
  { label: "P2P Transfers", path: "/app/p2p/transfer", icon: ArrowLeftRight },
  { label: "Deposits", path: "/app/deposit", icon: Wallet },
];

export const digitalAssetNav: NavItem[] = [
  { label: "Giftcards ", path: "/app/giftcards", icon: GiftIcon },
  { label: "Virtual Cards", path: "/app/cards", icon: CreditCard },
];

export const customerNav: NavItem[] = [
  { label: "Manage Customers", path: "/app/customers", icon: Users },
  { label: "Identity Verification", path: "/app/verification", icon: BadgeCheck },
];

export const transactionyNav: NavItem[] = [
  { label: "Transactions", path: "/app/transactions", icon: History },
  { label: "Payment Link", path: "/app/paymentlink", icon: Link },
  { label: "Bills Payment", path: "/app/bills", icon: Receipt },
  { label: "Invoices", path: "/app/invoices", icon: FileText },
];

export const secondaryNav: NavItem[] = [
  { label: "Account Settings", path: "/app/settings/account", icon: User },
  { label: "Security Settings", path: "/app/settings/security", icon: ShieldCheck },
];

export const tertiaryNav: NavItem[] = [
  { label: "System Settings", path: "/app/system/settings", icon: Settings },
  { label: "Bills Pricing", path: "/app/system/pricing", icon: Calculator },
  { label: "Payment Gateway", path: "/app/system/gateway", icon: WalletCards },
];

export const footerNav: NavItem[] = [
  { label: "Support Ticket", path: "/app/support", icon: LifeBuoy },
];