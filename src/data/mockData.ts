import type {
  ApiKey,
  Card,
  Invoice,
  Recipient,
  SupportTicket,
  Transaction,
} from "@/types";

export const currentUser = {
  id: "usr_001",
  fullName: "Alesia Kirkland",
  email: "alesia.k@vistapay.io",
  phone: "+234 801 234 5678",
  kycStatus: "Verified" as const,
  avatarInitial: "A",
  twoFactorEnabled: false,
};

export const transactions: Transaction[] = [
  { id: "t1", name: "Gym", category: "Payment", date: "Jul 29, 2022", time: "08:00 PM", invoiceId: "PMX09812", amount: 300, status: "Pending", icon: "Zap", color: "#F3B65A" },
  { id: "t2", name: "AI-Bank", category: "Deposit", date: "Jul 27, 2022", time: "09:00 PM", invoiceId: "PMX0979", amount: -890.15, status: "Success", icon: "Landmark", color: "#7FD1B9" },
  { id: "t3", name: "McDonald", category: "Payment", date: "Jul 25, 2022", time: "05:00 PM", invoiceId: "OVF19244", amount: -600, status: "Success", icon: "UtensilsCrossed", color: "#F2A6C1" },
  { id: "t4", name: "Amazon", category: "Payment", date: "Jul 22, 2022", time: "08:00 AM", invoiceId: "AMX09871", amount: 1243, status: "Pending", icon: "ShoppingBag", color: "#F5C57B" },
  { id: "t5", name: "Facebook Ads", category: "Payment", date: "Jul 19, 2022", time: "11:00 PM", invoiceId: "PMX09873", amount: -123, status: "Failed", icon: "Megaphone", color: "#93A9F2" },
  { id: "t6", name: "Light Bill", category: "Payment", date: "Jul 15, 2022", time: "07:00 AM", invoiceId: "AMX89786", amount: -190, status: "Success", icon: "Zap", color: "#F3B65A" },
  { id: "t7", name: "UI8 Payment", category: "Payment", date: "Jul 15, 2022", time: "05:00 PM", invoiceId: "AMX89785", amount: -1565.99, status: "Success", icon: "Palette", color: "#8FCBE0" },
  { id: "t8", name: "eBay", category: "Payment", date: "Jul 14, 2022", time: "09:00 AM", invoiceId: "AMX76543", amount: -10, status: "Success", icon: "ShoppingBag", color: "#F2A6C1" },
];

export const cards: Card[] = [
  {
    id: "c1",
    brand: "Mastercard",
    tier: "Platinum",
    last4: "1987",
    fullNumber: "5562 5566 5577 1987",
    expiry: "11/27",
    balance: 24098,
    gradientFrom: "#0E3B39",
    gradientTo: "#0A2E2C",
  },
  {
    id: "c2",
    brand: "Mastercard",
    tier: "Silver",
    last4: "1987",
    fullNumber: "5562 5566 5577 1987",
    expiry: "09/26",
    balance: 32378,
    gradientFrom: "#134B48",
    gradientTo: "#0A2E2C",
  },
];

export const recipients: Recipient[] = [
  { id: "r1", name: "Guy Hawkins", role: "Frequent", avatarColor: "#F3B65A", bank: "GTBank", accountNumber: "0123456789", favorite: true },
  { id: "r2", name: "Angy Hawkins", role: "Family", avatarColor: "#93A9F2", bank: "Access Bank", accountNumber: "0234567891", favorite: true },
  { id: "r3", name: "Robert Hisson", role: "Vendor", avatarColor: "#F2A6C1", bank: "Zenith Bank", accountNumber: "0345678912", favorite: false },
  { id: "r4", name: "Angela Vatiga", role: "SEO Expert", avatarColor: "#7FD1B9", bank: "UBA", accountNumber: "0456789123", favorite: false },
];

export const invoices: Invoice[] = [
  {
    id: "inv1", number: "0245", client: "Vero Agency", clientEmail: "billing@veroagency.com", clientAddress: "14 Adeola Odeku St, Victoria Island, Lagos",
    amount: 9146, status: "Sent", issueDate: "Sep 10, 2022", dueDate: "Sep 12, 2022",
    items: [
      { id: "i1", description: "Poster Design Project", qty: 1, rate: 500 },
      { id: "i2", description: "Logo Design Concepts", qty: 5, rate: 1729.2 },
    ],
    notes: "Payment due within 2 days of invoice date. Late payments may incur a 2% fee.",
  },
  {
    id: "inv2", number: "0244", client: "Northline Co", clientEmail: "accounts@northline.co", clientAddress: "8 Ademola Adetokunbo Cres, Abuja",
    amount: 6789, status: "Paid", issueDate: "Aug 28, 2022", dueDate: "Sep 02, 2022",
    items: [{ id: "i1", description: "Brand Strategy Consulting", qty: 3, rate: 2263 }],
    notes: "Thank you for your business.",
  },
  {
    id: "inv3", number: "0243", client: "Bluewave Studio", clientEmail: "hello@bluewavestudio.io", clientAddress: "22 Awolowo Rd, Ikoyi, Lagos",
    amount: 1250, status: "Overdue", issueDate: "Aug 14, 2022", dueDate: "Aug 21, 2022",
    items: [{ id: "i1", description: "Website Landing Page", qty: 1, rate: 1250 }],
  },
  {
    id: "inv4", number: "0242", client: "Fenwick Ltd", clientEmail: "finance@fenwick.ltd", clientAddress: "3 Kofo Abayomi St, Victoria Island, Lagos",
    amount: 4300, status: "Draft", issueDate: "Aug 09, 2022", dueDate: "Aug 16, 2022",
    items: [{ id: "i1", description: "Social Media Management (Aug)", qty: 1, rate: 4300 }],
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "tk1", subject: "Unable to complete bank transfer", category: "Transfers", status: "Open", priority: "High",
    createdAt: "Sep 02, 2026", lastUpdate: "2 hours ago",
    messages: [
      { id: "m1", sender: "user", senderName: "You", body: "My transfer to GTBank keeps failing at the confirmation step. Can you check?", time: "Sep 02, 9:14 AM" },
      { id: "m2", sender: "agent", senderName: "VistaPay Support", body: "Thanks for reaching out — we're looking into this now. Could you share the account number you were sending to?", time: "Sep 02, 9:41 AM" },
      { id: "m3", sender: "user", senderName: "You", body: "Sure, it's 0123456789, GTBank.", time: "Sep 02, 9:44 AM" },
    ],
  },
  {
    id: "tk2", subject: "Airtime purchase not credited", category: "Bills Payment", status: "In Progress", priority: "Medium",
    createdAt: "Aug 30, 2026", lastUpdate: "1 day ago",
    messages: [
      { id: "m1", sender: "user", senderName: "You", body: "I paid ₦2,000 for MTN airtime but it never landed on my line.", time: "Aug 30, 4:02 PM" },
      { id: "m2", sender: "agent", senderName: "VistaPay Support", body: "Sorry about that — we've escalated this to MTN and will update you within 24 hours.", time: "Aug 30, 5:10 PM" },
    ],
  },
  {
    id: "tk3", subject: "2FA reset request", category: "Security", status: "Resolved", priority: "High",
    createdAt: "Aug 21, 2026", lastUpdate: "6 days ago",
    messages: [
      { id: "m1", sender: "user", senderName: "You", body: "Lost my authenticator device, need my 2FA reset.", time: "Aug 21, 11:00 AM" },
      { id: "m2", sender: "agent", senderName: "VistaPay Support", body: "We've verified your identity and reset 2FA on your account. You can set it up again from Security Settings.", time: "Aug 21, 2:35 PM" },
    ],
  },
];

export const apiKeys: ApiKey[] = [
  { id: "k1", label: "Production Server", keyPreview: "dp_live_••••••••7f2a", environment: "Live", createdAt: "Jun 02, 2026", lastUsed: "3 minutes ago", status: "Active" },
  { id: "k2", label: "Staging", keyPreview: "dp_test_••••••••90bd", environment: "Test", createdAt: "Apr 18, 2026", lastUsed: "2 days ago", status: "Active" },
  { id: "k3", label: "Old integration", keyPreview: "dp_live_••••••••11c4", environment: "Live", createdAt: "Jan 05, 2026", lastUsed: "94 days ago", status: "Revoked" },
];

export const moneyFlow7 = [
  { label: "Sat", value: 180 },
  { label: "Sun", value: 260 },
  { label: "Mon", value: 140 },
  { label: "Tues", value: 400 },
  { label: "Wed", value: 220 },
  { label: "Thu", value: 260 },
  { label: "Fri", value: 190 },
  { label: "Sat", value: 320 },
  { label: "Sun", value: 240 },
  { label: "Mon", value: 210 },
  { label: "Tues", value: 400 },
  { label: "Wed", value: 260 },
  { label: "Thu", value: 300 },
  { label: "Fri", value: 340 },
];

export const billerCategories = {
  airtime: ["MTN", "Airtel", "Glo", "9mobile"],
  internet: ["Spectranet", "Smile", "MTN Data", "Airtel Data"],
  cable: ["DStv", "GOtv", "StarTimes", "ShowMax"],
  utilities: ["Ikeja Electric", "Eko Electric", "Lagos Water Corp", "Abuja Disco"],
};
