import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  Loader2, 
  PlusCircle, 
  MinusCircle, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { 
  fetchCustomerById, 
  adjustCustomerWallet, 
  grantCustomerApiAccess, 
  updateCustomerApiStatus, 
  Customer, 
  CustomerTransaction 
} from "@/api/customer";

export const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Wallet Adjustment Modal States
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRemark, setAdjustRemark] = useState("");
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  // API Access Modal States
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantingApi, setGrantingApi] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApiStatus, setSelectedApiStatus] = useState<"active" | "revoked" | "suspended">("active");
  const [updatingApiStatus, setUpdatingApiStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadCustomerDetails(id);
    }
  }, [id]);

  const loadCustomerDetails = async (custId: string) => {
    try {
      setLoading(true);
      const res = await fetchCustomerById(custId);
      if (res.status && res.data) {
        setCustomer(res.data.customer);
        const txData = res.data.transactions;
        const rows = Array.isArray(txData) ? txData : (txData as any)?.data || [];
        setTransactions(rows);
      }
    } catch (err: any) {
      push("Failed to load customer details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !adjustAmount || !adjustRemark) {
      push("Please fill in all adjustment fields.", "error");
      return;
    }

    try {
      setSubmittingAdjustment(true);
      const res = await adjustCustomerWallet(id, {
        action: actionType,
        amount: Number(adjustAmount),
        remark: adjustRemark,
      });

      if (res.status) {
        push(res.message || "Wallet adjustment successful!", "success");
        setAdjustModalOpen(false);
        setAdjustAmount("");
        setAdjustRemark("");
        loadCustomerDetails(id);
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to adjust wallet.", "error");
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Handle Granting API Access
  const handleGrantApiAccess = async () => {
    if (!id) return;
    try {
      setGrantingApi(true);
      const res = await grantCustomerApiAccess(id);
      if (res.status) {
        push(res.message || "API access granted successfully!", "success");
        setGrantModalOpen(false);
        loadCustomerDetails(id);
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to grant API access.", "error");
    } finally {
      setGrantingApi(false);
    }
  };

  // Handle Updating API Access Status
  const handleUpdateApiStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setUpdatingApiStatus(true);
      const res = await updateCustomerApiStatus(id, selectedApiStatus);
      if (res.status) {
        push(res.message || "API status updated successfully!", "success");
        setStatusModalOpen(false);
        loadCustomerDetails(id);
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update API status.", "error");
    } finally {
      setUpdatingApiStatus(false);
    }
  };

  const txColumns: DataTableColumn<CustomerTransaction>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (t) => t.reference,
      render: (t) => (
        <div>
          <p className="font-mono text-xs font-bold text-ink-900">{t.reference}</p>
          <p className="text-[11px] text-ink-900/50">{t.remark || "Transaction"}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      exportValue: (t) => t.type,
      render: (t) => (
        <span className={`text-xs font-bold capitalize ${t.type === "credit" ? "text-state-success" : "text-state-error"}`}>
          {t.type}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (t) => formatNaira(t.amount),
      render: (t) => <span className="font-bold text-ink-900">{formatNaira(t.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (t) => t.status,
      render: (t) => <Badge status={t.status as any} />,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (t) => new Date(t.created_at).toLocaleString(),
      render: (t) => <span className="text-xs text-ink-900/60">{new Date(t.created_at).toLocaleString()}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm text-ink-900/60">Customer not found.</p>
        <button onClick={() => navigate("/admin/customers")} className="btn-secondary mt-4">
          Back to Customers List
        </button>
      </div>
    );
  }

  // Check apiaccess from endpoint (fallback to api_access if needed)
  const apiAccess = (customer as any).apiaccess || (customer as any).api_access || null;
  const hasApiAccess = apiAccess && Object.keys(apiAccess).length > 0;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <button
          onClick={() => navigate("/admin/customers")}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-900/60 hover:text-ink-900"
        >
          <ArrowLeft size={16} /> Back to Customers
        </button>
        <div className="flex items-center gap-3">
          {!hasApiAccess ? (
            <button
              onClick={() => setGrantModalOpen(true)}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
            >
              <KeyRound size={15} /> Grant API Access
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedApiStatus(apiAccess.status || "active");
                setStatusModalOpen(true);
              }}
              className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <KeyRound size={15} /> Manage API Access
            </button>
          )}
          <button
            onClick={() => setAdjustModalOpen(true)}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
          >
            <Wallet size={15} /> Adjust Wallet
          </button>
        </div>
      </div>

      {/* Profile Overview Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card space-y-3 lg:col-span-1 border border-surface-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-ink-900/40">Customer Profile</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                customer.status === "active" ? "bg-state-successbg text-state-success" : "bg-state-failedbg text-state-error"
              }`}
            >
              {customer.status}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-ink-900">{customer.name}</h3>
            <p className="text-xs text-ink-900/60">{customer.email}</p>
            <p className="text-xs text-ink-900/60 mt-0.5">{customer.phone || "No phone number"}</p>
          </div>
          <div className="border-t border-surface-border pt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-900/50">KYC Status</span>
              <span className="font-bold text-primary uppercase">Tier {customer.kyc?.current_level || 0} ({customer.kyc?.status || "Pending"})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-900/50">API Access Status</span>
              <span className={`font-bold capitalize px-2 py-0.5 rounded text-[10px] ${
                apiAccess?.status === "active" 
                  ? "bg-state-successbg text-state-success" 
                  : apiAccess 
                  ? "bg-state-failedbg text-state-error" 
                  : "bg-surface-muted text-ink-900/50"
              }`}>
                {hasApiAccess ? apiAccess.status : "Not Provisioned"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-900/50">Joined Date</span>
              <span className="font-medium text-ink-900">{new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="card lg:col-span-2 border border-surface-border bg-surface-muted/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-ink-900/40">Wallet Account Float</span>
              <Wallet className="text-primary" size={20} />
            </div>
            <p className="text-3xl font-extrabold text-ink-900">
              {formatNaira(customer.wallet?.balance || 0)}
            </p>
            <p className="text-xs text-ink-900/50 mt-1">
              Ledger Balance: {formatNaira(customer.wallet?.ledger_balance || 0)}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setActionType("credit");
                setAdjustModalOpen(true);
              }}
              className="btn-secondary py-2 px-3 text-xs text-state-success border-state-success/30 hover:bg-state-successbg flex items-center gap-1.5"
            >
              <PlusCircle size={14} /> Credit Wallet
            </button>
            <button
              onClick={() => {
                setActionType("debit");
                setAdjustModalOpen(true);
              }}
              className="btn-secondary py-2 px-3 text-xs text-state-error border-state-error/30 hover:bg-state-failedbg flex items-center gap-1.5"
            >
              <MinusCircle size={14} /> Debit Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Cards Section */}
      <div className="card space-y-4 border border-surface-border">
        <h4 className="font-bold text-ink-900 text-sm flex items-center gap-2">
          <CreditCard size={16} className="text-primary" /> Associated Virtual Cards ({customer.virtualcards?.length || 0})
        </h4>
        {customer.virtualcards && customer.virtualcards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.virtualcards.map((card) => (
              <div key={card.id} className="rounded-xl border border-surface-border p-4 bg-surface-muted space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-ink-900">•••• {card.masked_card.slice(-4)}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${card.status === "active" ? "bg-state-successbg text-state-success" : "bg-state-failedbg text-state-error"}`}>
                    {card.status}
                  </span>
                </div>
                <p className="text-xs text-ink-900/50">Balance: <span className="font-bold text-ink-900">{formatNaira(card.balance)}</span></p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-900/40 py-4 text-center">No virtual cards assigned to this customer.</p>
        )}
      </div>

      {/* Transactions Audit Table */}
      <div className="card p-4 sm:p-6 space-y-4 border border-surface-border">
        <h4 className="font-bold text-ink-900 text-sm">Customer Transaction Audit History</h4>
        <DataTable
          columns={txColumns}
          rows={transactions}
          fileName={`customer-${customer.id}-transactions`}
          emptyLabel="No transactions recorded for this customer."
          pageSize={15}
        />
      </div>

      {/* --- GRANT API ACCESS CONFIRMATION MODAL --- */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-ink-900 text-base">Grant API Access</h3>
              <button onClick={() => setGrantModalOpen(false)} className="text-ink-900/50 hover:text-ink-900">✕</button>
            </div>
            <p className="text-xs text-ink-900/70">
              Are you sure you want to provision API access for <strong className="text-ink-900">{customer.name}</strong>? This will generate public and secret keys for external developer consumption.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setGrantModalOpen(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button onClick={handleGrantApiAccess} disabled={grantingApi} className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2">
                {grantingApi && <Loader2 size={14} className="animate-spin" />}
                Confirm & Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- UPDATE API STATUS MODAL --- */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-ink-900 text-base">Manage API Access Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-ink-900/50 hover:text-ink-900">✕</button>
            </div>

            <form onSubmit={handleUpdateApiStatus} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-900/70">Select Status</label>
                <select
                  value={selectedApiStatus}
                  onChange={(e) => setSelectedApiStatus(e.target.value as any)}
                  className="input-field mt-1 w-full text-xs capitalize"
                  required
                >
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
                <p className="text-[11px] text-ink-900/40 mt-1">
                  Updating this status will immediately affect the customer's ability to call external APIs.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStatusModalOpen(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
                <button type="submit" disabled={updatingApiStatus} className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2">
                  {updatingApiStatus && <Loader2 size={14} className="animate-spin" />}
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- WALLET ADJUSTMENT MODAL --- */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-ink-900 text-lg capitalize">
                {actionType} Customer Wallet
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-ink-900/50 hover:text-ink-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleWalletAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-900/70">Amount (₦)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-900/70">Audit Remark / Reason</label>
                <input
                  type="text"
                  value={adjustRemark}
                  onChange={(e) => setAdjustRemark(e.target.value)}
                  placeholder="e.g. Manual refund / Dispute resolution"
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjustment}
                  className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  {submittingAdjustment && <Loader2 size={14} className="animate-spin" />}
                  Confirm {actionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};