import React, { useEffect, useState } from "react";
import { CreditCard, Search, Loader2, Edit3, X, Save, Plus, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { fetchGateways, updateGateway, toggleGatewayStatus, PaymentGateway } from "@/api/gateway";

interface CredentialPair {
  key: string;
  value: string;
}

export const PaymentGateways: React.FC = () => {
  const { push } = useToast();

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // Edit Drawer State
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    currency: "NGN",
    min_amount: 100,
    max_amount: 5000000,
    fixed_charge: 0,
    percent_charge: 0,
    instructions: "",
  });
  const [credentialsList, setCredentialsList] = useState<CredentialPair[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const res = await fetchGateways();
      if (res.status && res.data) {
        setGateways(res.data);
      }
    } catch (err: any) {
      push("Failed to load payment gateways.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (gw: PaymentGateway) => {
    setEditingGateway(gw);
    setEditForm({
      name: gw.name || "",
      currency: gw.currency || "NGN",
      min_amount: Number(gw.min_amount || 100),
      max_amount: Number(gw.max_amount || 5000000),
      fixed_charge: Number(gw.fixed_charge || 0),
      percent_charge: Number(gw.percent_charge || 0),
      instructions: gw.instructions || "",
    });

    // Convert object credentials into an array of { key, value } pairs for dynamic inputs
    if (gw.credentials && typeof gw.credentials === "object") {
      const pairs = Object.entries(gw.credentials).map(([k, v]) => ({
        key: k,
        value: String(v || ""),
      }));
      setCredentialsList(pairs);
    } else {
      setCredentialsList([]);
    }
  };

  // Add a new empty credential row
  const handleAddCredential = () => {
    setCredentialsList([...credentialsList, { key: "", value: "" }]);
  };

  // Remove a credential row
  const handleRemoveCredential = (index: number) => {
    setCredentialsList(credentialsList.filter((_, i) => i !== index));
  };

  // Update specific credential row key or value
  const handleCredentialChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...credentialsList];
    updated[index][field] = val;
    setCredentialsList(updated);
  };

  const handleUpdateGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;

    // Convert key-value pairs back to an object for JSON storage
    let credentialsObj: Record<string, string> | null = null;
    if (editingGateway.code !== "manual" && credentialsList.length > 0) {
      credentialsObj = {};
      credentialsList.forEach((item) => {
        if (item.key.trim()) {
          credentialsObj![item.key.trim()] = item.value;
        }
      });
    }

    try {
      setUpdating(true);
      const res = await updateGateway(editingGateway.id, {
        name: editForm.name,
        currency: editForm.currency,
        min_amount: editForm.min_amount,
        max_amount: editForm.max_amount,
        fixed_charge: editForm.fixed_charge,
        percent_charge: editForm.percent_charge,
        instructions: editForm.instructions || null,
        credentials: credentialsObj,
      });

      if (res.status) {
        push(res.message || "Payment gateway updated successfully!", "success");
        setEditingGateway(null);
        loadGateways();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update payment gateway.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (gw: PaymentGateway) => {
    const newStatus = !gw.is_active;
    try {
      const res = await toggleGatewayStatus(gw.id, newStatus);
      if (res.status) {
        setGateways((prev) =>
          prev.map((item) => (item.id === gw.id ? { ...item, is_active: newStatus } : item))
        );
        push(`Gateway ${newStatus ? "activated" : "deactivated"} successfully.`, "success");
      }
    } catch (err: any) {
      push("Failed to update gateway status.", "error");
    }
  };

  const filteredGateways = gateways.filter(
    (gw) =>
      gw.name.toLowerCase().includes(search.toLowerCase()) ||
      gw.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<PaymentGateway>[] = [
    {
      key: "name",
      header: "Gateway",
      exportValue: (gw) => gw.name,
      render: (gw) => (
        <div>
          <p className="font-bold text-ink-900">{gw.name}</p>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-muted text-ink-900/60">
            {gw.code}
          </span>
        </div>
      ),
    },
    {
      key: "currency",
      header: "Currency",
      exportValue: (gw) => gw.currency,
      render: (gw) => (
        <span className="font-bold text-xs uppercase px-2 py-1 rounded bg-primary/10 text-primary">
          {gw.currency}
        </span>
      ),
    },
    {
      key: "limits",
      header: "Limits (Min - Max)",
      exportValue: (gw) => `${gw.min_amount} - ${gw.max_amount}`,
      render: (gw) => (
        <div className="text-xs">
          <p className="text-ink-900">Min: {gw.min_amount.toLocaleString()}</p>
          <p className="text-ink-900/50">Max: {gw.max_amount.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: "charges",
      header: "Charges",
      exportValue: (gw) => `${gw.percent_charge}%`,
      render: (gw) => (
        <div className="text-xs">
          <p className="font-bold text-ink-900">{gw.percent_charge}%</p>
          <p className="text-[11px] text-ink-900/50">+ ₦{gw.fixed_charge} fixed</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (gw) => (gw.is_active ? "Active" : "Disabled"),
      render: (gw) => {
        const isActive = Boolean(gw.is_active);
        return (
          <button
            onClick={() => handleToggleStatus(gw)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-state-success" : "bg-gray-300"
            }`}
            title="Toggle gateway status"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (gw) => (
        <button
          onClick={() => handleOpenEdit(gw)}
          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Edit3 size={13} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> Payment Gateways Configuration
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Manage deposit gateways, transaction limits, processing fees, and API credentials.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 sm:p-6 space-y-4 border border-surface-border">
        <div className="max-w-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gateways..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredGateways}
            fileName="admin-payment-gateways"
            emptyLabel="No payment gateways found."
            pageSize={20}
          />
        )}
      </div>

      {/* --- EDIT SIDE DRAWER (SIDENAV) --- */}
      {editingGateway && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <CreditCard className="text-primary" size={18} />
                <h3 className="font-bold text-ink-900 text-sm">Edit Gateway: {editingGateway.name}</h3>
              </div>
              <button
                onClick={() => setEditingGateway(null)}
                className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateGateway} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-ink-900/70">Gateway Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-field mt-1 w-full text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-ink-900/70">Currency</label>
                  <input
                    type="text"
                    value={editForm.currency}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                    className="input-field mt-1 w-full text-xs uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-ink-900/70">Min Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.min_amount}
                    onChange={(e) => setEditForm({ ...editForm, min_amount: Number(e.target.value) })}
                    className="input-field mt-1 w-full text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-ink-900/70">Max Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.max_amount}
                    onChange={(e) => setEditForm({ ...editForm, max_amount: Number(e.target.value) })}
                    className="input-field mt-1 w-full text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-ink-900/70">Fixed Charge</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.fixed_charge}
                    onChange={(e) => setEditForm({ ...editForm, fixed_charge: Number(e.target.value) })}
                    className="input-field mt-1 w-full text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-ink-900/70">Percentage Charge (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editForm.percent_charge}
                    onChange={(e) => setEditForm({ ...editForm, percent_charge: Number(e.target.value) })}
                    className="input-field mt-1 w-full text-xs"
                    required
                  />
                </div>
              </div>

              {editingGateway.code === "manual" ? (
                <div>
                  <label className="font-medium text-ink-900/70">Bank Transfer Instructions</label>
                  <textarea
                    rows={5}
                    value={editForm.instructions}
                    onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                    className="input-field mt-1 w-full text-xs font-mono"
                    placeholder="Enter bank account details and deposit instructions..."
                  />
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-surface-border">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-ink-900">API Credentials (Key / Value)</label>
                    <button
                      type="button"
                      onClick={handleAddCredential}
                      className="btn-secondary py-1 px-2 text-[11px] flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Key
                    </button>
                  </div>

                  {credentialsList.length === 0 && (
                    <p className="text-xs text-ink-900/40 italic">No credentials configured. Click "Add Key" to start.</p>
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {credentialsList.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Key (e.g. public_key)"
                          value={item.key}
                          onChange={(e) => handleCredentialChange(index, "key", e.target.value)}
                          className="input-field w-1/3 text-xs font-mono"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={item.value}
                          onChange={(e) => handleCredentialChange(index, "value", e.target.value)}
                          className="input-field flex-1 text-xs font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCredential(index)}
                          className="p-2 text-state-error hover:bg-state-error/10 rounded-lg transition"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Save Gateway Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};