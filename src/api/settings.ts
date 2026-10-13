import { apiClient } from "@/lib/axios";

export interface SystemSettings {
  // Dynamic fallback for key-value dictionary access
  [key: string]: any;

  // Branding & General
  site_name?: string;
  currency_code?: string;
  currency_symbol?: string;

  // Provider Settings
  nuban_provider?: string;
  payout_provider?: string;
  airtime_provider?: string;
  internet_provider?: string;
  utility_provider?: string;
  cable_provider?: string;
  insurance_provider?: string;
  transfer_charge?: number;
  usd_to_ngn_rate?: number;
  card_creation_fee_usd?: number;

  // Feature Toggles & Maintenance
  maintenance_mode?: string | number;
  maintenance_message?: string;
  sms_notification?: string | number;
  email_notification?: string | number;
  push_notification?: string | number;
  airtime_enabled?: string | number;
  internet_enabled?: string | number;
  cabletv_enabled?: string | number;
  utility_enabled?: string | number;

  // Airtime Tier Limits
  airtime_daily_limit_new_user?: number;
  airtime_weekly_limit_new_user?: number;
  airtime_monthly_limit_new_user?: number;
  airtime_daily_limit_old_user?: number;
  airtime_weekly_limit_old_user?: number;
  airtime_monthly_limit_old_user?: number;

  // Transfer Tier Limits
  transfer_daily_limit_new_user?: number;
  transfer_weekly_limit_new_user?: number;
  transfer_montly_limit_new_user?: number;
  transfer_daily_limit_old_user?: number;
  transfer_weekly_limit_old_user?: number;
  transfer_montly_limit_old_user?: number;
}

/**
 * Fetch all system settings
 */
export async function fetchSettings(): Promise<{ status: boolean; data: SystemSettings }> {
  const res = await apiClient.get("/system/settings");
  return res.data;
}

/**
 * Update General Branding & Identity (Supports Multipart File Uploads)
 */
export async function updateGeneralSettings(
  formData: FormData
): Promise<{ status: boolean; message: string; data: SystemSettings }> {
  const res = await apiClient.post("/system/settings/general", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Update API Providers, Gateways & Financial Rates
 */
export async function updateProviderSettings(payload: {
  nuban_provider: string;
  payout_provider: string;
  airtime_provider: string;
  internet_provider: string;
  utility_provider: string;
  cable_provider: string;
  insurance_provider: string;
  transfer_charge: number;
  usd_to_ngn_rate: number;
  card_creation_fee_usd: number;
}): Promise<{ status: boolean; message: string; data: SystemSettings }> {
  const res = await apiClient.post("/system/settings/providers", payload);
  return res.data;
}

/**
 * Update Feature Toggles, Limits & Notifications
 */
export async function updateToggleSettings(
  payload: Partial<SystemSettings>
): Promise<{ status: boolean; message: string; data: SystemSettings }> {
  const res = await apiClient.post("/system/settings/toggles", payload);
  return res.data;
}
/**
 * Update Feature Toggles, Limits & Notifications
 */
export async function updateLimitSettings(
  payload: Partial<SystemSettings>
): Promise<{ status: boolean; message: string; data: SystemSettings }> {
  const res = await apiClient.post("/system/settings/limits", payload);
  return res.data;
}