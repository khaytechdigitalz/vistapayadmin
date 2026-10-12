import { apiClient } from "@/lib/axios";

export interface ApiKeyItem {
  id: string;
  label: string;
  keyPreview: string;
  environment: "Test" | "Live";
  status: "Active" | "Revoked";
  lastUsed: string;
  createdAt: string;
}

export interface ApiSettingsData {
  keys: ApiKeyItem[];
  webhookUrl: string;
  secret_hash?: string;
}

export async function fetchApiSettings(): Promise<{ status: boolean; data: ApiSettingsData }> {
  const res = await apiClient.get("/vservices/api-settings");
  return res.data;
}

export async function generateApiKey(label: string, environment = "Test"): Promise<{ status: boolean; message: string; secret_key?: string; data: ApiKeyItem }> {
  const res = await apiClient.post("/vservices/api-settings/generate-key", { label, environment });
  return res.data;
}

export async function revokeApiKey(id: string): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post(`/vservices/api-settings/revoke-key/${id}`);
  return res.data;
}

export async function saveWebhookUrl(url: string): Promise<{ status: boolean; message: string }> {
  const res = await apiClient.post("/vservices/api-settings/save-webhook", { url });
  return res.data;
}