import React, { useEffect, useState } from "react";
import { Copy, KeyRound, Plus, Trash2, Webhook, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { SettingsNav } from "./SettingsNav";
import {
  fetchApiSettings,
  generateApiKey,
  revokeApiKey,
  saveWebhookUrl,
  ApiKeyItem,
} from "@/api/apiSettings";

export const ApiSettings: React.FC = () => {
  const { push } = useToast();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingWebhook, setSavingWebhook] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  
  const [label, setLabel] = useState("");
  const [environment, setEnvironment] = useState<"Test" | "Live">("Test");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Modal secret display state
  const [newCreatedSecret, setNewCreatedSecret] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchApiSettings();
      if (res.status && res.data) {
        setKeys(res.data.keys);
        setWebhookUrl(res.data.webhookUrl || "");
      }
    } catch (err: any) {
      push("Failed to load API settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      push("Please give your key a label", "error");
      return;
    }

    try {
      const res = await generateApiKey(label, environment);
      if (res.status && res.data) {
        setKeys((prev) => [res.data, ...prev]);
        if (res.secret_key) setNewCreatedSecret(res.secret_key);
        push("New API key generated", "success");
        setLabel("");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to generate key.", "error");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await revokeApiKey(id);
      if (res.status) {
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)));
        push("Key revoked successfully", "info");
      }
    } catch (err: any) {
      push("Failed to revoke API key.", "error");
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      push("Enter a valid Webhook URL", "error");
      return;
    }

    try {
      setSavingWebhook(true);
      const res = await saveWebhookUrl(webhookUrl);
      if (res.status) {
        push("Webhook endpoint saved successfully", "success");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to save webhook URL.", "error");
    } finally {
      setSavingWebhook(false);
    }
  };

  const columns: DataTableColumn<ApiKeyItem>[] = [
    {
      key: "label",
      header: "Label",
      exportValue: (k) => k.label,
      render: (k) => <span className="font-semibold text-ink-900">{k.label}</span>,
    },
    {
      key: "keyPreview",
      header: "Key",
      exportValue: (k) => k.keyPreview,
      render: (k) => (
        <button
          onClick={() => {
            navigator.clipboard?.writeText(k.keyPreview);
            push("Key preview copied to clipboard", "info");
          }}
          className="flex items-center gap-1.5 font-mono text-xs text-ink-900/70 hover:text-ink-900"
        >
          {k.keyPreview} <Copy size={12} />
        </button>
      ),
    },
    {
      key: "environment",
      header: "Environment",
      exportValue: (k) => k.environment,
      render: (k) => (
        <span className={`pill ${k.environment === "Live" ? "bg-state-successbg text-state-success" : "bg-surface-muted text-ink-900/60"}`}>
          {k.environment}
        </span>
      ),
    },
    {
      key: "lastUsed",
      header: "Last used",
      exportValue: (k) => k.lastUsed,
      render: (k) => <span className="text-ink-900/60">{k.lastUsed}</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (k) => k.status,
      render: (k) => <Badge status={k.status} />,
    },
    {
      key: "actions",
      header: "",
      exportValue: () => "",
      render: (k) =>
        k.status === "Active" ? (
          <button onClick={() => handleRevoke(k.id)} className="rounded-lg p-2 text-state-failed hover:bg-state-failedbg">
            <Trash2 size={14} />
          </button>
        ) : null,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
      <SettingsNav />

      <div className="space-y-5">
        <div className="card">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <KeyRound size={16} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900">API Keys</h3>
                <p className="text-xs text-ink-900/50">Use these keys to authenticate requests to the VistaPay API.</p>
              </div>
            </div>
            <button onClick={() => setOpen(true)} className="btn-primary">
              <Plus size={16} /> Generate Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              rows={keys}
              fileName="api-keys"
              emptyLabel="No API keys yet."
              filters={{ statusKey: "status", searchKeys: ["label", "keyPreview"] }}
            />
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
              <Webhook size={16} />
            </span>
            <div>
              <h3 className="font-bold text-ink-900">Webhooks</h3>
              <p className="text-xs text-ink-900/50">Receive real-time events for transfers, bill payments and more.</p>
            </div>
          </div>
          <div className="max-w-lg space-y-4">
            <Input
              label="Endpoint URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yourdomain.com/webhooks/vistapay"
            />
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink-900/60">
              {["transfer.completed", "bill.paid", "invoice.paid", "card.created"].map((ev) => (
                <span key={ev} className="rounded-lg bg-surface-muted px-2.5 py-1.5">{ev}</span>
              ))}
            </div>
            <button className="btn-secondary" onClick={handleSaveWebhook} disabled={savingWebhook}>
              {savingWebhook ? <Loader2 size={16} className="animate-spin" /> : "Save Endpoint"}
            </button>
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setNewCreatedSecret(null);
        }}
        title="Generate API Key"
        description="New keys start in test mode."
      >
        {newCreatedSecret ? (
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 size={36} className="text-state-success mx-auto" />
            <p className="text-xs text-ink-900/60 font-medium">
              Copy your secret key now. For security reasons, it won't be shown again!
            </p>

            <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-surface-border font-mono text-xs font-bold text-primary">
              <span className="truncate pr-2">{newCreatedSecret}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(newCreatedSecret);
                  push("Secret key copied!", "info");
                }}
                className="shrink-0 p-1 hover:bg-white rounded-lg text-ink-900/60"
              >
                <Copy size={16} />
              </button>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                setNewCreatedSecret(null);
              }}
              className="btn-primary w-full mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="space-y-4">
            <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Mobile App" required />

            <div>
              <label className="label">Environment</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEnvironment("Test")}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    environment === "Test" ? "border-primary bg-primary-50 text-primary" : "border-surface-border text-ink-900/60"
                  }`}
                >
                  Test Mode
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment("Live")}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    environment === "Live" ? "border-primary bg-primary-50 text-primary" : "border-surface-border text-ink-900/60"
                  }`}
                >
                  Live Mode
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">Generate Key</button>
          </form>
        )}
      </Modal>
    </div>
  );
};