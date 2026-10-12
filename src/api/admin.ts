import { apiClient } from "@/lib/axios";

export interface SystemWallet {
  total_balance: number;
  total_pending_balance: number;
}

export interface UsersOverview {
  total_customers: number;
  registered_this_month: number;
  registered_this_week: number;
  active_users: number;
  inactive_users: number;
}

export interface DemographyItem {
  country?: string;
  city?: string;
  browser?: string;
  total: number;
}

export interface AdminDemographics {
  by_country: DemographyItem[];
  by_city: DemographyItem[];
  by_browser: DemographyItem[];
}

export interface AdminTransaction {
  id: number;
  user_id: number;
  amount: string;
  charge: string;
  balance_before: string;
  balance_after: string;
  type: "credit" | "debit";
  reference: string;
  details: string | null;
  remark: string;
  service_provider: string;
  api_response: any;
  status: "success" | "pending" | "failed";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ChartDataPoint {
  date: string;
  total_count: number;
  credit_amount: string;
  debit_amount: string;
  total_amount: string;
}

export interface TransactionStatItem {
  remark: string;
  total_amount: string;
  total_count: number;
}

export interface DashboardData {
  users_overview: UsersOverview;
  demographics: AdminDemographics;
  system_wallet: SystemWallet;
  active_filter: string;
  transaction_chart: ChartDataPoint[];
  transaction_stats: Record<string, TransactionStatItem>;
  recent_transactions: AdminTransaction[];
  nuban?: any; // Maintained for backwards compatibility
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}

export async function fetchDashboard(filter: string = "7days") {
  const response = await apiClient.get<DashboardResponse>(`/dashboard?filter=${filter}`);
  return response.data;
}


export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  dob: string | null;
  avatar: string | null;
  google2fa_enabled: number;
  type: string;
  last_login: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  data: CustomerProfile;
}

export async function LoginSessions() {
  const response = await apiClient.get("/login-sessions");
  return response.data;
}


export async function fetchProfile(): Promise<ProfileResponse> {
  const response = await apiClient.get<ProfileResponse>("/profile");
  return response.data;
}

export async function updateProfile(data: {
  name: string;
  phone?: string;
  dob?: string;
}): Promise<ProfileResponse> {
  const response = await apiClient.post<ProfileResponse>("/profile", data);
  return response.data;
}

export async function updateProfileAvatar(file: File): Promise<ProfileResponse> {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await apiClient.post<ProfileResponse>("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
export interface TwoFactorStatusResponse {
  status: boolean;
  message: string;
  data: {
    google2fa_enabled: boolean;
    google2fa_secret?: string;
  };
}

export interface TwoFactorSetupResponse {
  status: boolean;
  message: string;
  data: {
    secret: string;
    qr_code_url?: string; // Can be base64 string, SVG, or URL
    inline_svg?: string;
  };
}

// ---------- Security: password, PIN & 2FA ----------
export async function changePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string; }) {
  const response = await apiClient.post("/security/password", data);
  return response.data;
}

export async function changePin(data: {
  pin: string;
  pin_confirmation: string;
}) {
  const response = await apiClient.post("/security/pin", data);
  return response.data;
}

export async function fetchTwoFactorStatus(): Promise<TwoFactorStatusResponse> {
  const response = await apiClient.get<TwoFactorStatusResponse>("/security/2fa");
  return response.data;
}

export async function enableTwoFactor(): Promise<TwoFactorSetupResponse> {
  const response = await apiClient.post<TwoFactorSetupResponse>("/security/2fa/setup");
  return response.data;
}

export async function confirmTwoFactor(code: string) {
  const response = await apiClient.post("/security/2fa/enable", { code });
  return response.data;
}

export async function disableTwoFactor(code: string) {
  const response = await apiClient.post("/security/2fa/disable", { code });
  return response.data;
}

// ---------- Logout ----------
export async function logoutUser() {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}