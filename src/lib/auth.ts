// src/lib/auth.ts

const TOKEN_KEY = "auth_token";
// Add "vistapay_token" here so legacy or context-saved tokens get found and migrated automatically
const LEGACY_KEYS = ["token", "vistapay_token"];

export function getAuthToken(): string | null {
  const primaryToken = localStorage.getItem(TOKEN_KEY);
  if (primaryToken) return primaryToken;

  // Migration fallback: check legacy keys and migrate if found
  for (const legacyKey of LEGACY_KEYS) {
    const legacyToken = localStorage.getItem(legacyKey);
    if (legacyToken) {
      localStorage.setItem(TOKEN_KEY, legacyToken); // Migrate to canonical key
      localStorage.removeItem(legacyKey); // Clean up old key
      return legacyToken;
    }
  }

  return null;
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // Clean up any lingering legacy keys to maintain a single source of truth
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}