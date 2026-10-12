declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
      readonly NEXT_PUBLIC_STORAGE_URL?: string;
      readonly NEXT_PUBLIC_API_BASE_URL?: string;
      readonly VITE_API_BASE_URL: string;
  }
}

const API_STORAGE_URL = import.meta.env?.VITE_STORAGE_URL ?? "";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

let currencySymbol = "₦"; // Default fallback symbol
 
export function formatCurrency(value: number): string {
  return `${currencySymbol}${value.toFixed(2)}`;
}

/**
 * Resolves media storage URLs, supporting full external URLs and relative storage paths.
 */
export function getImageSrc(path?: string | null, fallback: string = "/images/placeholder.png"): string {
  if (!path) return fallback;

  // 1. If it's already a full absolute URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // 2. Trim trailing slashes from base URL & leading slashes from path
  const baseUrl = (API_STORAGE_URL || "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (!baseUrl) return `/${cleanPath}`;

  return `${baseUrl}/${cleanPath}`;
}
