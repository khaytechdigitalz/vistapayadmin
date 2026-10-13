import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Cpu,
  Gauge,
  Globe,
  Loader2,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  ToggleLeft,
  UploadCloud,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { getImageSrc } from "@/lib/utils";
import {
  fetchSettings,
  updateGeneralSettings,
  updateProviderSettings,
  updateToggleSettings,
} from "@/api/settings";

/* ------------------------------------------------------------------ */
/* Config & defaults                                                   */
/* ------------------------------------------------------------------ */

type TabType = "general" | "providers" | "toggles" | "limits";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General & Branding", icon: Globe },
  { id: "providers", label: "API Providers & Rates", icon: Cpu },
  { id: "toggles", label: "Toggles", icon: ToggleLeft },
  { id: "limits", label: "Transaction Limits", icon: Gauge },
];

const DEFAULT_GENERAL = {
  site_name: "",
  site_email: "",
  site_phone: "",
  site_currency: "NGN",
  currency_symbol: "₦",
  global_meta_title: "",
  global_meta_description: "",
};
type GeneralKey = keyof typeof DEFAULT_GENERAL;

// Numeric fields are kept as strings in form state so inputs can be cleared while typing.
const DEFAULT_PROVIDERS = {
  nuban_provider: "STROWALLET",
  payout_provider: "MONNIFY",
  airtime_provider: "vtpass",
  internet_provider: "vtpass",
  utility_provider: "vtpass",
  cable_provider: "vtpass",
  insurance_provider: "vtpass",
  transfer_charge: "100",
  usd_to_ngn_rate: "1500",
  card_creation_fee_usd: "2",
};
type ProviderKey = keyof typeof DEFAULT_PROVIDERS;

const GATEWAY_OPTIONS = [
  { value: "STROWALLET", label: "STROWALLET" },
  { value: "MONNIFY", label: "MONNIFY" },
];
const SERVICE_PROVIDER_OPTIONS = [
  { value: "vtpass", label: "VTPASS" },
  { value: "vtunaija", label: "VTUNAIJA" },
];

const GATEWAY_FIELDS: { key: ProviderKey; label: string }[] = [
  { key: "nuban_provider", label: "NUBAN / Virtual Account Provider" },
  { key: "payout_provider", label: "Bank Payout Provider" },
];
const SERVICE_PROVIDER_FIELDS: { key: ProviderKey; label: string }[] = [
  { key: "airtime_provider", label: "Airtime Provider" },
  { key: "internet_provider", label: "Internet / Data Provider" },
  { key: "utility_provider", label: "Utility / Electricity Provider" },
  { key: "cable_provider", label: "Cable TV Provider" },
  { key: "insurance_provider", label: "Insurance Provider" },
];

const DEFAULT_FLAGS = {
  maintenance_mode: "0",
  sms_notification: "1",
  email_notification: "1",
  push_notification: "1",
  airtime_enabled: "1",
  internet_enabled: "1",
  cabletv_enabled: "1",
  utility_enabled: "1",
};
type FlagKey = keyof typeof DEFAULT_FLAGS;

const SERVICE_TOGGLES: { key: FlagKey; label: string }[] = [
  { key: "airtime_enabled", label: "Airtime" },
  { key: "internet_enabled", label: "Internet Data" },
  { key: "cabletv_enabled", label: "Cable TV" },
  { key: "utility_enabled", label: "Electricity Utility" },
];
const NOTIFICATION_TOGGLES: { key: FlagKey; label: string }[] = [
  { key: "sms_notification", label: "SMS Alerts" },
  { key: "email_notification", label: "Email Alerts" },
  { key: "push_notification", label: "Push Notifications" },
];

const DEFAULT_LIMITS = {
  airtime_daily_limit_new_user: 10000,
  airtime_weekly_limit_new_user: 50000,
  airtime_monthly_limit_new_user: 150000,
  airtime_daily_limit_old_user: 50000,
  airtime_weekly_limit_old_user: 200000,
  airtime_monthly_limit_old_user: 1000000,
  transfer_daily_limit_new_user: 50000,
  transfer_weekly_limit_new_user: 200000,
  transfer_montly_limit_new_user: 500000, // "montly" matches the backend key spelling
  transfer_daily_limit_old_user: 500000,
  transfer_weekly_limit_old_user: 2500000,
  transfer_montly_limit_old_user: 10000000,
};
type LimitKey = keyof typeof DEFAULT_LIMITS;

type Kind = "airtime" | "transfer";
type Tier = "new_user" | "old_user";

const periodFields = (kind: Kind, tier: Tier): { label: string; key: LimitKey }[] => [
  { label: "Daily Limit", key: `${kind}_daily_limit_${tier}` as LimitKey },
  { label: "Weekly Limit", key: `${kind}_weekly_limit_${tier}` as LimitKey },
  {
    label: "Monthly Limit",
    key: (kind === "transfer" ? `transfer_montly_limit_${tier}` : `airtime_monthly_limit_${tier}`) as LimitKey,
  },
];

const LIMIT_SECTIONS = [
  { name: "Airtime", title: "Airtime Purchase Limits (₦)", kind: "airtime" as Kind },
  { name: "Bank transfer", title: "Bank Transfer Limits (₦)", kind: "transfer" as Kind },
].map((s) => ({
  ...s,
  groups: [
    { name: "new users", label: "New Users (< 7 Days Account Age)", fields: periodFields(s.kind, "new_user") },
    { name: "old users", label: "Old Users (≥ 7 Days Account Age)", fields: periodFields(s.kind, "old_user") },
  ],
}));

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isBlank = (v: unknown) => v === undefined || v === null || v === "";
const asText = (v: unknown, fallback: string) => (isBlank(v) ? fallback : String(v));
const asFlag = (v: unknown, fallback: string) =>
  isBlank(v) ? fallback : v === true || v === 1 || v === "1" || v === "true" ? "1" : "0";
const toNumber = (s: string) => (s.trim() === "" ? NaN : Number(s));

const initialLimits = (): Record<LimitKey, string> =>
  Object.fromEntries(Object.entries(DEFAULT_LIMITS).map(([k, v]) => [k, String(v)])) as Record<LimitKey, string>;

/** Returns an error message, or null when every tier has valid, ascending limits. */
function validateLimits(limits: Record<LimitKey, string>): string | null {
  for (const section of LIMIT_SECTIONS) {
    for (const group of section.groups) {
      const [d, w, m] = group.fields.map((f) => toNumber(limits[f.key]));
      if ([d, w, m].some((n) => !Number.isFinite(n) || n < 0)) {
        return `${section.name} limits for ${group.name}: enter valid amounts.`;
      }
      if (d > w || w > m) {
        return `${section.name} limits for ${group.name}: daily can't exceed weekly, and weekly can't exceed monthly.`;
      }
    }
  }
  return null;
}

/** Local preview URL for a chosen file, revoked automatically. */
function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

const labelCls = "text-xs font-medium text-ink-900/70";
const inputCls = "input-field mt-1 w-full text-xs";

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}> = ({ label, value, onChange, type = "text", required, rows, maxLength, placeholder }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
};

const NumberField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  step?: string;
  small?: boolean;
}> = ({ label, value, onChange, min = "0", step = "any", small }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={small ? "text-[11px] font-medium text-ink-900/70" : labelCls}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
        required
      />
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
};

const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  danger?: boolean;
}> = ({ checked, onChange, label, danger }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      checked ? (danger ? "bg-state-error" : "bg-primary") : "bg-gray-300"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-muted/30 p-3">
    <span className="text-xs font-semibold text-ink-900">{label}</span>
    <Switch checked={checked} onChange={onChange} label={label} />
  </div>
);

const FileField: React.FC<{
  label: string;
  file: File | null;
  previewSrc?: string | null;
  onChange: (f: File | null) => void;
}> = ({ label, file, previewSrc, onChange }) => (
  <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-muted p-4">
    {previewSrc && (
      <img src={previewSrc} alt={`${label} preview`} className="h-12 w-12 rounded border bg-white object-contain p-1" />
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-ink-900">{label}</p>
      <label className="btn-secondary mt-1 inline-flex cursor-pointer px-2.5 py-1 text-xs">
        <UploadCloud size={13} className="mr-1" /> Choose File
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
      {file && <p className="mt-1 truncate text-[11px] text-ink-900/50">{file.name}</p>}
    </div>
  </div>
);

const SettingsForm: React.FC<{
  title: string;
  description: string;
  saveLabel: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}> = ({ title, description, saveLabel, submitting, onSubmit, children }) => (
  <form onSubmit={onSubmit} className="card space-y-5 border border-surface-border">
    <div className="border-b border-surface-border pb-3">
      <h4 className="text-sm font-bold text-ink-900">{title}</h4>
      <p className="text-xs text-ink-900/50">{description}</p>
    </div>
    {children}
    <div className="flex justify-end pt-2">
      <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-xs disabled:opacity-60">
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saveLabel}
      </button>
    </div>
  </form>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const Settings: React.FC = () => {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [general, setGeneral] = useState(DEFAULT_GENERAL);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [metaImageFile, setMetaImageFile] = useState<File | null>(null);
  const pendingLogoUrl = useObjectUrl(logoFile);

  const [providers, setProviders] = useState(DEFAULT_PROVIDERS);
  const [flags, setFlags] = useState<Record<FlagKey, string>>(DEFAULT_FLAGS);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [limits, setLimits] = useState<Record<LimitKey, string>>(initialLimits);

  // Used to confirm before switching maintenance mode ON.
  const maintenanceWasOn = useRef(false);

  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await fetchSettings();
      if (!res.status || !res.data) {
        setLoadError(true);
        return;
      }
      const d = res.data;

      setGeneral({
        site_name: asText(d.site_name, ""),
        site_email: asText(d.site_email, ""),
        site_phone: asText(d.site_phone, ""),
        // The API type declares `currency_code`; the form posts `site_currency`. Accept either on read.
        site_currency: asText(isBlank(d.site_currency) ? d.currency_code : d.site_currency, "NGN"),
        currency_symbol: asText(d.currency_symbol, "₦"),
        global_meta_title: asText(d.global_meta_title, ""),
        global_meta_description: asText(d.global_meta_description, ""),
      });
      setLogoPreview(d.logo || "");

      const nextProviders = { ...DEFAULT_PROVIDERS };
      (Object.keys(DEFAULT_PROVIDERS) as ProviderKey[]).forEach((k) => {
        nextProviders[k] = asText(d[k], DEFAULT_PROVIDERS[k]);
      });
      setProviders(nextProviders);

      const nextFlags = { ...DEFAULT_FLAGS };
      (Object.keys(DEFAULT_FLAGS) as FlagKey[]).forEach((k) => {
        nextFlags[k] = asFlag(d[k], DEFAULT_FLAGS[k]);
      });
      setFlags(nextFlags);
      maintenanceWasOn.current = nextFlags.maintenance_mode === "1";
      setMaintenanceMessage(asText(d.maintenance_message, ""));

      const nextLimits = initialLimits();
      (Object.keys(DEFAULT_LIMITS) as LimitKey[]).forEach((k) => {
        nextLimits[k] = asText(d[k], String(DEFAULT_LIMITS[k]));
      });
      setLimits(nextLimits);
    } catch {
      setLoadError(true);
      push("Failed to load system settings", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  /* ---------- field setters ---------- */

  const setGeneralField = (k: GeneralKey) => (v: string) => setGeneral((p) => ({ ...p, [k]: v }));
  const setProviderField = (k: ProviderKey) => (v: string) => setProviders((p) => ({ ...p, [k]: v }));
  const setLimitField = (k: LimitKey) => (v: string) => setLimits((p) => ({ ...p, [k]: v }));
  const setFlag = (k: FlagKey) => (on: boolean) => setFlags((p) => ({ ...p, [k]: on ? "1" : "0" }));

  /* ---------- submit handlers ---------- */

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const formData = new FormData();
    (Object.keys(general) as GeneralKey[]).forEach((k) => formData.append(k, general[k].trim()));
    if (logoFile) formData.append("logo", logoFile);
    if (metaImageFile) formData.append("global_meta_image", metaImageFile);

    try {
      setSubmitting(true);
      const res = await updateGeneralSettings(formData);
      if (res.status) {
        push(res.message || "General settings updated!", "success");
        if (res.data?.logo) setLogoPreview(res.data.logo);
        setLogoFile(null);
        setMetaImageFile(null);
      } else {
        push(res.message || "Failed to update general settings", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update general settings", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const transfer_charge = toNumber(providers.transfer_charge);
    const usd_to_ngn_rate = toNumber(providers.usd_to_ngn_rate);
    const card_creation_fee_usd = toNumber(providers.card_creation_fee_usd);

    if (!Number.isFinite(transfer_charge) || transfer_charge < 0) {
      push("Enter a valid transfer charge.", "error");
      return;
    }
    if (!Number.isFinite(usd_to_ngn_rate) || usd_to_ngn_rate <= 0) {
      push("Enter a valid USD to NGN rate.", "error");
      return;
    }
    if (!Number.isFinite(card_creation_fee_usd) || card_creation_fee_usd < 0) {
      push("Enter a valid card creation fee.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateProviderSettings({
        nuban_provider: providers.nuban_provider,
        payout_provider: providers.payout_provider,
        airtime_provider: providers.airtime_provider,
        internet_provider: providers.internet_provider,
        utility_provider: providers.utility_provider,
        cable_provider: providers.cable_provider,
        insurance_provider: providers.insurance_provider,
        transfer_charge,
        usd_to_ngn_rate,
        card_creation_fee_usd,
      });
      if (res.status) {
        push(res.message || "API providers updated successfully!", "success");
      } else {
        push(res.message || "Failed to update API providers", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update API providers", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /** Toggles share one endpoint, so both tabs save the same combined payload. */
  const handleToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const limitError = validateLimits(limits);
    if (limitError) {
      push(limitError, "error");
      return;
    }

    if (
      flags.maintenance_mode === "1" &&
      !maintenanceWasOn.current &&
      !window.confirm("Turn on maintenance mode? Users will be blocked until it is switched off.")
    ) {
      return;
    }

    const numericLimits = Object.fromEntries(
      (Object.keys(limits) as LimitKey[]).map((k) => [k, Number(limits[k])])
    );

    try {
      setSubmitting(true);
      const res = await updateToggleSettings({
        ...flags,
        maintenance_message: maintenanceMessage.trim(),
        ...numericLimits,
      });
      if (res.status) {
        maintenanceWasOn.current = flags.maintenance_mode === "1";
        push(res.message || "Settings updated successfully!", "success");
      } else {
        push(res.message || "Failed to update settings", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update settings", "error");
    } finally {
      setSubmitting(false);
    }
  };


  /** Limits share one endpoint, so both tabs save the same combined payload. */
  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const limitError = validateLimits(limits);
    if (limitError) {
      push(limitError, "error");
      return;
    }

    if (
      flags.maintenance_mode === "1" &&
      !maintenanceWasOn.current &&
      !window.confirm("Turn on maintenance mode? Users will be blocked until it is switched off.")
    ) {
      return;
    }

    const numericLimits = Object.fromEntries(
      (Object.keys(limits) as LimitKey[]).map((k) => [k, Number(limits[k])])
    );

    try {
      setSubmitting(true);
      const res = await updateToggleSettings({
        ...flags,
        maintenance_message: maintenanceMessage.trim(),
        ...numericLimits,
      });
      if (res.status) {
        maintenanceWasOn.current = flags.maintenance_mode === "1";
        push(res.message || "Settings updated successfully!", "success");
      } else {
        push(res.message || "Failed to update settings", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update settings", "error");
    } finally {
      setSubmitting(false);
    }
  };


  /* ---------- render ---------- */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Never show editable defaults when the real settings failed to load; saving them would overwrite live config.
  if (loadError) {
    return (
      <div className="card mx-auto max-w-md space-y-3 p-8 text-center">
        <h3 className="text-lg font-bold text-ink-900">Couldn't load settings</h3>
        <p className="text-xs text-ink-900/60">
          Settings are hidden so default values can't accidentally overwrite your live configuration.
        </p>
        <button onClick={loadAllSettings} className="btn-primary mx-auto flex items-center gap-1.5 py-2 text-xs">
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Page header */}
      <div className="border-b border-surface-border pb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-ink-900 sm:text-xl">
          <SettingsIcon size={20} className="text-primary" /> System Configuration & Settings
        </h3>
        <p className="text-xs text-ink-900/55 sm:text-sm">
          Manage global branding, select API service providers, set financial rates, and control feature toggles.
        </p>
      </div>

      {/* Tabs (scroll horizontally on small screens) */}
      <div role="tablist" className="-mx-1 flex gap-2 overflow-x-auto border-b border-surface-border px-1 pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === id
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-muted text-ink-900/70 hover:bg-surface-border"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & BRANDING */}
      {activeTab === "general" && (
        <SettingsForm
          title="Site Identity & Meta Branding"
          description="Configure platform title, support channels, and logos."
          saveLabel="Save General Settings"
          submitting={submitting}
          onSubmit={handleGeneralSubmit}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Site Name" value={general.site_name} onChange={setGeneralField("site_name")} required />
            <TextField
              label="Support Email"
              type="email"
              value={general.site_email}
              onChange={setGeneralField("site_email")}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Phone Number" type="tel" value={general.site_phone} onChange={setGeneralField("site_phone")} required />
            <TextField
              label="Currency Code"
              value={general.site_currency}
              onChange={(v) => setGeneralField("site_currency")(v.toUpperCase())}
              maxLength={3}
              required
            />
            <TextField
              label="Currency Symbol"
              value={general.currency_symbol}
              onChange={setGeneralField("currency_symbol")}
              required
            />
          </div>

          <TextField label="Global Meta Title" value={general.global_meta_title} onChange={setGeneralField("global_meta_title")} />
          <TextField
            label="Global Meta Description"
            rows={2}
            value={general.global_meta_description}
            onChange={setGeneralField("global_meta_description")}
          />

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <FileField
              label="Platform Logo"
              file={logoFile}
              previewSrc={pendingLogoUrl || (logoPreview ? getImageSrc(logoPreview) : null)}
              onChange={setLogoFile}
            />
            <FileField label="Global OG Meta Image" file={metaImageFile} onChange={setMetaImageFile} />
          </div>
        </SettingsForm>
      )}

      {/* TAB 2: API PROVIDERS & RATES */}
      {activeTab === "providers" && (
        <SettingsForm
          title="Financial Gateways & Utility Providers"
          description="Configure core banking APIs, service providers, and exchange rates."
          saveLabel="Save Provider Settings"
          submitting={submitting}
          onSubmit={handleProviderSubmit}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GATEWAY_FIELDS.map((f) => (
              <SelectField
                key={f.key}
                label={f.label}
                value={providers[f.key]}
                onChange={setProviderField(f.key)}
                options={GATEWAY_OPTIONS}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_PROVIDER_FIELDS.map((f) => (
              <SelectField
                key={f.key}
                label={f.label}
                value={providers[f.key]}
                onChange={setProviderField(f.key)}
                options={SERVICE_PROVIDER_OPTIONS}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-surface-border pt-4 sm:grid-cols-3">
            <NumberField
              label="Transfer Charge (₦)"
              step="1"
              value={providers.transfer_charge}
              onChange={setProviderField("transfer_charge")}
            />
            <NumberField
              label="USD to NGN Rate (₦)"
              min="0.01"
              step="0.01"
              value={providers.usd_to_ngn_rate}
              onChange={setProviderField("usd_to_ngn_rate")}
            />
            <NumberField
              label="Virtual Card Creation Fee ($)"
              step="0.01"
              value={providers.card_creation_fee_usd}
              onChange={setProviderField("card_creation_fee_usd")}
            />
          </div>
        </SettingsForm>
      )}

      {/* TAB 3: FEATURE & NOTIFICATION TOGGLES */}
      {activeTab === "toggles" && (
        <SettingsForm
          title="Feature Toggles & Notifications"
          description="Enable or disable service modules, alert channels, and maintenance mode."
          saveLabel="Save Feature Toggles"
          submitting={submitting}
          onSubmit={handleToggleSubmit}
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-muted/40 p-3.5">
            <div>
              <p className="text-xs font-bold text-ink-900">Maintenance Mode</p>
              <p className="text-[11px] text-ink-900/50">
                {flags.maintenance_mode === "1" ? "System Under Maintenance" : "System Live & Operational"}
              </p>
            </div>
            <Switch
              danger
              label="Maintenance mode"
              checked={flags.maintenance_mode === "1"}
              onChange={setFlag("maintenance_mode")}
            />
          </div>

          {flags.maintenance_mode === "1" && (
            <TextField
              label="Maintenance Notice Message"
              value={maintenanceMessage}
              onChange={setMaintenanceMessage}
              placeholder="e.g. System upgrade in progress. Back shortly!"
            />
          )}

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-900/50">Service Modules</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICE_TOGGLES.map((t) => (
                <ToggleRow key={t.key} label={t.label} checked={flags[t.key] === "1"} onChange={setFlag(t.key)} />
              ))}
            </div>
          </div>

          <div className="border-t border-surface-border pt-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-900/50">Notification Channels</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {NOTIFICATION_TOGGLES.map((t) => (
                <ToggleRow key={t.key} label={t.label} checked={flags[t.key] === "1"} onChange={setFlag(t.key)} />
              ))}
            </div>
          </div>
        </SettingsForm>
      )}

      {/* TAB 4: TRANSACTION LIMITS */}
      {activeTab === "limits" && (
        <SettingsForm
          title="Tier-Based Transaction Limits"
          description="Configure daily, weekly, and monthly threshold caps for Airtime and Bank Transfers."
          saveLabel="Save Transaction Limits"
          submitting={submitting}
          onSubmit={handleLimitSubmit}
        >
          {LIMIT_SECTIONS.map((section) => (
            <div key={section.kind} className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-primary">{section.title}</h5>
              {section.groups.map((group) => (
                <div
                  key={group.label}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface-muted/40 p-4 sm:grid-cols-3"
                >
                  <p className="text-xs font-bold text-ink-900 sm:col-span-3">{group.label}</p>
                  {group.fields.map((f) => (
                    <NumberField
                      key={f.key}
                      small
                      label={f.label}
                      value={limits[f.key]}
                      onChange={setLimitField(f.key)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </SettingsForm>
      )}
    </div>
  );
};
