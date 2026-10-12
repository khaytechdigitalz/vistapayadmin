import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Globe, Cpu, ToggleLeft, Loader2, UploadCloud, Save } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { getImageSrc } from "@/lib/utils";
import {
  fetchSettings,
  updateGeneralSettings,
  updateProviderSettings,
  updateToggleSettings,
} from "@/api/settings";

type TabType = "general" | "providers" | "toggles";

export const Settings: React.FC = () => {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // General State
  const [generalForm, setGeneralForm] = useState({
    site_name: "",
    site_email: "",
    site_phone: "",
    site_currency: "NGN",
    currency_symbol: "₦",
    global_meta_title: "",
    global_meta_description: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [metaImageFile, setMetaImageFile] = useState<File | null>(null);

  // Providers State
  const [providerForm, setProviderForm] = useState({
    nuban_provider: "STROWALLET",
    payout_provider: "MONNIFY",
    airtime_provider: "vtpass",
    internet_provider: "vtpass",
    utility_provider: "vtpass",
    cable_provider: "vtpass",
    insurance_provider: "vtpass",
    transfer_charge: 100,
    usd_to_ngn_rate: 1500,
    card_creation_fee_usd: 2,
  });

  // Toggles State
  const [toggleForm, setToggleForm] = useState({
    maintenance_mode: "0",
    maintenance_message: "",
    sms_notification: "1",
    email_notification: "1",
    push_notification: "1",
    airtime_enabled: "1",
    internet_enabled: "1",
    cabletv_enabled: "1",
    utility_enabled: "1",
    airtime_daily_limit: 5000,
  });

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchSettings();
      if (res.status && res.data) {
        const d = res.data;
        setGeneralForm({
          site_name: d.site_name || "",
          site_email: d.site_email || "",
          site_phone: d.site_phone || "",
          site_currency: d.site_currency || "NGN",
          currency_symbol: d.currency_symbol || "₦",
          global_meta_title: d.global_meta_title || "",
          global_meta_description: d.global_meta_description || "",
        });
        if (d.logo) {
          setLogoPreview(d.logo);
        }

        setProviderForm({
          nuban_provider: d.nuban_provider || "STROWALLET",
          payout_provider: d.payout_provider || "MONNIFY",
          airtime_provider: d.airtime_provider || "vtpass",
          internet_provider: d.internet_provider || "vtpass",
          utility_provider: d.utility_provider || "vtpass",
          cable_provider: d.cable_provider || "vtpass",
          insurance_provider: d.insurance_provider || "vtpass",
          transfer_charge: Number(d.transfer_charge || 100),
          usd_to_ngn_rate: Number(d.usd_to_ngn_rate || 1500),
          card_creation_fee_usd: Number(d.card_creation_fee_usd || 2),
        });

        setToggleForm({
          maintenance_mode: d.maintenance_mode || "0",
          maintenance_message: d.maintenance_message || "",
          sms_notification: d.sms_notification || "1",
          email_notification: d.email_notification || "1",
          push_notification: d.push_notification || "1",
          airtime_enabled: d.airtime_enabled || "1",
          internet_enabled: d.internet_enabled || "1",
          cabletv_enabled: d.cabletv_enabled || "1",
          utility_enabled: d.utility_enabled || "1",
          airtime_daily_limit: Number(d.airtime_daily_limit || 5000),
        });
      }
    } catch (err: any) {
      push("Failed to load system settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(generalForm).forEach(([key, val]) => {
      formData.append(key, val);
    });
    if (logoFile) formData.append("logo", logoFile);
    if (metaImageFile) formData.append("global_meta_image", metaImageFile);

    try {
      setSubmitting(true);
      const res = await updateGeneralSettings(formData);
      if (res.status) {
        push(res.message || "General settings updated!", "success");
        if (res.data.logo) setLogoPreview(res.data.logo);
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update general settings", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await updateProviderSettings(providerForm);
      if (res.status) {
        push(res.message || "API providers updated successfully!", "success");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update API providers", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await updateToggleSettings(toggleForm);
      if (res.status) {
        push(res.message || "System toggles updated successfully!", "success");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update system toggles", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" /> System Configuration & Settings
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Manage global branding, select API service providers, set financial rates, and control feature toggles.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "general" ? "bg-primary text-white shadow-xs" : "bg-surface-muted text-ink-900/70 hover:bg-surface-border"
          }`}
        >
          <Globe size={15} /> General & Branding
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "providers" ? "bg-primary text-white shadow-xs" : "bg-surface-muted text-ink-900/70 hover:bg-surface-border"
          }`}
        >
          <Cpu size={15} /> API Providers & Rates
        </button>
        <button
          onClick={() => setActiveTab("toggles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "toggles" ? "bg-primary text-white shadow-xs" : "bg-surface-muted text-ink-900/70 hover:bg-surface-border"
          }`}
        >
          <ToggleLeft size={15} /> Toggles & Limits
        </button>
      </div>

      {/* --- TAB 1: GENERAL & BRANDING --- */}
      {activeTab === "general" && (
        <form onSubmit={handleGeneralSubmit} className="card space-y-5 border border-surface-border">
          <div className="border-b border-surface-border pb-3">
            <h4 className="font-bold text-ink-900 text-sm">Site Identity & Meta Branding</h4>
            <p className="text-xs text-ink-900/50">Configure platform title, support channels, and logos.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-900/70">Site Name</label>
              <input
                type="text"
                value={generalForm.site_name}
                onChange={(e) => setGeneralForm({ ...generalForm, site_name: e.target.value })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Support Email</label>
              <input
                type="email"
                value={generalForm.site_email}
                onChange={(e) => setGeneralForm({ ...generalForm, site_email: e.target.value })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-ink-900/70">Phone Number</label>
              <input
                type="text"
                value={generalForm.site_phone}
                onChange={(e) => setGeneralForm({ ...generalForm, site_phone: e.target.value })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Currency Code</label>
              <input
                type="text"
                value={generalForm.site_currency}
                onChange={(e) => setGeneralForm({ ...generalForm, site_currency: e.target.value })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Currency Symbol</label>
              <input
                type="text"
                value={generalForm.currency_symbol}
                onChange={(e) => setGeneralForm({ ...generalForm, currency_symbol: e.target.value })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-900/70">Global Meta Title</label>
            <input
              type="text"
              value={generalForm.global_meta_title}
              onChange={(e) => setGeneralForm({ ...generalForm, global_meta_title: e.target.value })}
              className="input-field mt-1 w-full text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-900/70">Global Meta Description</label>
            <textarea
              rows={2}
              value={generalForm.global_meta_description}
              onChange={(e) => setGeneralForm({ ...generalForm, global_meta_description: e.target.value })}
              className="input-field mt-1 w-full text-xs"
            />
          </div>

          {/* Logo Upload Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-surface-border p-4 flex items-center gap-4 bg-surface-muted">
              {logoPreview && (
                <img src={getImageSrc(logoPreview)} alt="Logo Preview" className="h-12 w-12 object-contain rounded bg-white p-1 border" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink-900">Platform Logo</p>
                <label className="btn-secondary mt-1 inline-flex cursor-pointer text-xs py-1 px-2.5">
                  <UploadCloud size={13} className="mr-1" /> Choose File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-surface-border p-4 flex items-center gap-4 bg-surface-muted">
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink-900">Global OG Meta Image</p>
                <label className="btn-secondary mt-1 inline-flex cursor-pointer text-xs py-1 px-2.5">
                  <UploadCloud size={13} className="mr-1" /> Choose File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setMetaImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-xs">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} /> Save General Settings
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: API PROVIDERS & RATES --- */}
      {activeTab === "providers" && (
        <form onSubmit={handleProviderSubmit} className="card space-y-5 border border-surface-border">
          <div className="border-b border-surface-border pb-3">
            <h4 className="font-bold text-ink-900 text-sm">Financial Gateways & Utility Providers</h4>
            <p className="text-xs text-ink-900/50">Configure core banking APIs, service providers, and exchange rates.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-900/70">NUBAN / Virtual Account Provider</label>
              <select
                value={providerForm.nuban_provider}
                onChange={(e) => setProviderForm({ ...providerForm, nuban_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs"
              >
                <option value="STROWALLET">STROWALLET</option>
                <option value="MONNIFY">MONNIFY</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Bank Payout Provider</label>
              <select
                value={providerForm.payout_provider}
                onChange={(e) => setProviderForm({ ...providerForm, payout_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs"
              >
                <option value="STROWALLET">STROWALLET</option>
                <option value="MONNIFY">MONNIFY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-ink-900/70">Airtime Provider</label>
              <select
                value={providerForm.airtime_provider}
                onChange={(e) => setProviderForm({ ...providerForm, airtime_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs uppercase"
              >
                <option value="vtpass">VTPASS</option>
                <option value="vtunaija">VTUNAIJA</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Internet / Data Provider</label>
              <select
                value={providerForm.internet_provider}
                onChange={(e) => setProviderForm({ ...providerForm, internet_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs uppercase"
              >
                <option value="vtpass">VTPASS</option>
                <option value="vtunaija">VTUNAIJA</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Utility / Electricity Provider</label>
              <select
                value={providerForm.utility_provider}
                onChange={(e) => setProviderForm({ ...providerForm, utility_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs uppercase"
              >
                <option value="vtpass">VTPASS</option>
                <option value="vtunaija">VTUNAIJA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-900/70">Cable TV Provider</label>
              <select
                value={providerForm.cable_provider}
                onChange={(e) => setProviderForm({ ...providerForm, cable_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs uppercase"
              >
                <option value="vtpass">VTPASS</option>
                <option value="vtunaija">VTUNAIJA</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Insurance Provider</label>
              <select
                value={providerForm.insurance_provider}
                onChange={(e) => setProviderForm({ ...providerForm, insurance_provider: e.target.value })}
                className="input-field mt-1 w-full text-xs uppercase"
              >
                <option value="vtpass">VTPASS</option>
                <option value="vtunaija">VTUNAIJA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-surface-border">
            <div>
              <label className="text-xs font-medium text-ink-900/70">Transfer Charge (₦)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={providerForm.transfer_charge}
                onChange={(e) => setProviderForm({ ...providerForm, transfer_charge: Number(e.target.value) })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">USD to NGN Rate (₦)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={providerForm.usd_to_ngn_rate}
                onChange={(e) => setProviderForm({ ...providerForm, usd_to_ngn_rate: Number(e.target.value) })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-900/70">Virtual Card Creation Fee (\$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={providerForm.card_creation_fee_usd}
                onChange={(e) => setProviderForm({ ...providerForm, card_creation_fee_usd: Number(e.target.value) })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-xs">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} /> Save Provider Settings
            </button>
          </div>
        </form>
      )}

     {/* --- TAB 3: TOGGLES & LIMITS --- */}
      {activeTab === "toggles" && (
        <form onSubmit={handleToggleSubmit} className="card space-y-5 border border-surface-border">
          <div className="border-b border-surface-border pb-3">
            <h4 className="font-bold text-ink-900 text-sm">Feature Toggles & Daily Limits</h4>
            <p className="text-xs text-ink-900/50">Enable or disable modules and control system maintenance mode.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Maintenance Mode Toggle Switch */}
            <div className="flex items-center justify-between rounded-xl border border-surface-border p-3.5 bg-surface-muted/40">
              <div>
                <p className="text-xs font-bold text-ink-900">Maintenance Mode</p>
                <p className="text-[11px] text-ink-900/50">
                  {toggleForm.maintenance_mode === "1" ? "System Under Maintenance" : "System Live & Operational"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setToggleForm((prev) => ({
                    ...prev,
                    maintenance_mode: prev.maintenance_mode === "1" ? "0" : "1",
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  toggleForm.maintenance_mode === "1" ? "bg-state-error" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    toggleForm.maintenance_mode === "1" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Airtime Daily Limit Input */}
            <div>
              <label className="text-xs font-medium text-ink-900/70">Airtime Daily Limit (₦)</label>
              <input
                type="number"
                min="0"
                value={toggleForm.airtime_daily_limit}
                onChange={(e) => setToggleForm({ ...toggleForm, airtime_daily_limit: Number(e.target.value) })}
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>
          </div>

          {/* Maintenance Message */}
          {toggleForm.maintenance_mode === "1" && (
            <div className="animate-in fade-in duration-200">
              <label className="text-xs font-medium text-ink-900/70">Maintenance Notice Message</label>
              <input
                type="text"
                value={toggleForm.maintenance_message}
                onChange={(e) => setToggleForm({ ...toggleForm, maintenance_message: e.target.value })}
                placeholder="e.g. System upgrade in progress. Back shortly!"
                className="input-field mt-1 w-full text-xs"
              />
            </div>
          )}

          {/* Service Module Toggles */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-900/50 mb-3">Service Modules</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Airtime */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Airtime</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      airtime_enabled: prev.airtime_enabled === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.airtime_enabled === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.airtime_enabled === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Internet Data */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Internet Data</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      internet_enabled: prev.internet_enabled === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.internet_enabled === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.internet_enabled === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Cable TV */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Cable TV</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      cabletv_enabled: prev.cabletv_enabled === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.cabletv_enabled === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.cabletv_enabled === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Electricity Utility */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Electricity Utility</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      utility_enabled: prev.utility_enabled === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.utility_enabled === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.utility_enabled === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Channel Toggles */}
          <div className="pt-3 border-t border-surface-border">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-900/50 mb-3">Notification Channels</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* SMS Notifications */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">SMS Alerts</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      sms_notification: prev.sms_notification === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.sms_notification === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.sms_notification === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Email Alerts</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      email_notification: prev.email_notification === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.email_notification === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.email_notification === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between rounded-xl border border-surface-border p-3 bg-surface-muted/30">
                <span className="text-xs font-semibold text-ink-900">Push Notifications</span>
                <button
                  type="button"
                  onClick={() =>
                    setToggleForm((prev) => ({
                      ...prev,
                      push_notification: prev.push_notification === "1" ? "0" : "1",
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    toggleForm.push_notification === "1" ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleForm.push_notification === "1" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-xs">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} /> Save Toggles & Limits
            </button>
          </div>
        </form>
      )}
    </div>
  );
};