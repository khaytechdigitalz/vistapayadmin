import React, { useEffect, useState } from "react";
import { History, Loader2, RefreshCcw, CheckCircle, XCircle, Eye, X, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import {
  fetchDepositHistory,
  approveDeposit,
  rejectDeposit,
  DepositRecord,
} from "@/api/deposit";
import { FileText, Download } from "lucide-react";
import { getImageSrc } from "@/lib/utils";

export const Deposit: React.FC = () => {
  const { push } = useToast();

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [summary, setSummary] = useState<Record<string, { total_count: number; total_amount: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Side-nav details modal state
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const res = await fetchDepositHistory();
      if (res.status && res.data) {
        const depositData = res.data.deposits;
        const rows = (depositData as any).data || depositData;
        setDeposits(Array.isArray(rows) ? rows : []);
        setSummary(res.data.status_summary || {});
      }
    } catch (err: any) {
      push("Failed to load deposit history records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId: number) => {
    try {
      setActionLoading(true);
      const res = await approveDeposit(depositId);
      if (res.status) {
        push("Deposit approved and wallet credited successfully.", "success");
        setSelectedDeposit(null);
        loadDeposits();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to approve deposit.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (depositId: number) => {
    try {
      setActionLoading(true);
      const res = await rejectDeposit(depositId);
      if (res.status) {
        push("Deposit rejected successfully.", "success");
        setSelectedDeposit(null);
        loadDeposits();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to reject deposit.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const depositColumns: DataTableColumn<DepositRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (d) => d.reference,
      render: (d) => <span className="font-mono text-xs font-bold text-ink-900">{d.reference}</span>,
    },
    {
      key: "user",
      header: "User",
      exportValue: (d) => d.user?.name ?? "",
      render: (d) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{d.user?.name || "N/A"}</p>
          <p className="text-[11px] text-ink-900/50">{d.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (d) => d.amount,
      render: (d) => <span className="font-extrabold text-ink-900">{formatNaira(parseFloat(d.amount))}</span>,
    },
    {
      key: "gateway",
      header: "Gateway / Method",
      exportValue: (d) => d.gateway,
      render: (d) => <span className="text-xs uppercase font-semibold text-ink-900/70">{d.gateway || "Manual"}</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (d) => d.status,
      render: (d) => <Badge status={d.status as any} />,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (d) => d.created_at,
      render: (d) => <span className="text-xs text-ink-900/60">{new Date(d.created_at).toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: (d) => d.id.toString(),
      render: (d) => (
        <button
          onClick={() => setSelectedDeposit(d)}
          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Eye size={13} /> Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <History size={18} className="text-primary" /> Deposit Management & History
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">Review, approve, or reject user deposits across the platform.</p>
        </div>
        <button onClick={loadDeposits} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCcw size={14} /> Refresh Records
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card bg-surface-muted p-4 border border-surface-border">
          <p className="text-xs text-ink-900/50 uppercase font-semibold">Pending Deposits</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {summary['pending']?.total_count || 0} <span className="text-xs font-normal text-ink-900/60">({formatNaira(summary['pending']?.total_amount || 0)})</span>
          </p>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border">
          <p className="text-xs text-ink-900/50 uppercase font-semibold">Successful Deposits</p>
          <p className="text-xl font-extrabold text-state-success mt-1">
            {summary['success']?.total_count || 0} <span className="text-xs font-normal text-ink-900/60">({formatNaira(summary['success']?.total_amount || 0)})</span>
          </p>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border">
          <p className="text-xs text-ink-900/50 uppercase font-semibold">Failed / Rejected</p>
          <p className="text-xl font-extrabold text-state-error mt-1">
            {summary['failed']?.total_count || 0} <span className="text-xs font-normal text-ink-900/60">({formatNaira(summary['failed']?.total_amount || 0)})</span>
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={depositColumns}
            rows={deposits}
            fileName="deposit-history"
            emptyLabel="No deposit records found."
            filters={{ searchKeys: ["reference", "gateway"] }}
          />
        )}
      </div>


{selectedDeposit && (
  <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary" size={20} />
          <h4 className="font-bold text-ink-900 text-base">Deposit Details</h4>
        </div>
        <button
          onClick={() => setSelectedDeposit(null)}
          className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
        <div className="rounded-xl bg-surface-muted p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-ink-900/50">Reference</span>
            <span className="font-mono font-bold text-ink-900">{selectedDeposit.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-900/50">Status</span>
            <Badge status={selectedDeposit.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-ink-900/50">Amount</span>
            <span className="font-extrabold text-ink-900 text-base">{formatNaira(parseFloat(selectedDeposit.amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-900/50">Gateway</span>
            <span className="font-semibold uppercase text-ink-900">{selectedDeposit.gateway || "Manual"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-900/50">Date Submitted</span>
            <span className="text-ink-900">{new Date(selectedDeposit.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Proof of Payment Section */}
        <div className="space-y-2">
          <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Proof Of Payment</h5>
          <div className="rounded-xl border border-surface-border p-4 flex items-center justify-between gap-4">
            {selectedDeposit.proof_file ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={getImageSrc(selectedDeposit.proof_file)}
                    alt="Proof of Payment"
                    className="h-16 w-16 rounded-2xl object-cover border border-surface-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/placeholder.png";
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-ink-900">Payment Document</p>
                    <p className="text-[11px] text-ink-900/50">Uploaded receipt file</p>
                  </div>
                </div>
                <a
                  href={getImageSrc(selectedDeposit.proof_file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} /> Download
                </a>
              </>
            ) : (
              <span className="flex h-16 w-full items-center justify-center rounded-2xl bg-surface-muted text-xs font-semibold text-ink-900/50">
                No Proof Of Payment
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">User Information</h5>
          <div className="rounded-xl border border-surface-border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-900/50">Name</span>
              <span className="font-semibold text-ink-900">{selectedDeposit.user?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-900/50">Email</span>
              <span className="text-ink-900">{selectedDeposit.user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-900/50">Phone</span>
              <span className="text-ink-900">{selectedDeposit.user?.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        {selectedDeposit.details && (
          <div className="space-y-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Additional Metadata</h5>
            <div className="rounded-xl bg-surface-muted p-3 text-xs font-mono overflow-x-auto text-ink-900/70">
              {typeof selectedDeposit.details === "string" ? selectedDeposit.details : JSON.stringify(selectedDeposit.details, null, 2)}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-surface-border bg-surface-muted/50 flex gap-3">
        {selectedDeposit.status === "pending" ? (
          <>
            <button
              disabled={actionLoading}
              onClick={() => handleReject(selectedDeposit.id)}
              className="btn-secondary flex-1 py-2 text-xs border-state-failed text-state-failed hover:bg-state-failedbg flex items-center justify-center gap-1.5"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={15} />}
              Reject Deposit
            </button>
            <button
              disabled={actionLoading}
              onClick={() => handleApprove(selectedDeposit.id)}
              className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={15} />}
              Approve Deposit
            </button>
          </>
        ) : (
          <button
            onClick={() => setSelectedDeposit(null)}
            className="btn-secondary w-full py-2 text-xs"
          >
            Close Drawer
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};