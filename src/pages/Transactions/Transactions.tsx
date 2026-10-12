import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { formatNaira } from "@/lib/currency";
import { useToast } from "@/context/ToastContext";
import {
  fetchTransactions,
  Transaction,
  TransactionQueryParams,
} from "@/api/transactions";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Search,
  Loader2,
  Copy,
  Receipt,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  User,
} from "lucide-react";

export const Transactions: React.FC = () => {
  const { push } = useToast();

  // Data & Pagination States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({
    total_volume: 0,
    total_amount: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<"debit" | "credit" | "">("");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | "">("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    loadTransactions();
  }, [search, type, status, fromDate, toDate, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: TransactionQueryParams = {
        search: search || undefined,
        type: (type as any) || undefined,
        status: (status as any) || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        per_page: 20,
      };

      const res = await fetchTransactions(params);
      if (res.status && res.data) {
        const txData = res.data.transactions;
        const rows = (txData as any).data || txData;
        setTransactions(Array.isArray(rows) ? rows : []);
        setMetrics(res.data.metrics || metrics);
      }
    } catch (err: any) {
      push("Failed to load platform transaction history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    push(`${label} copied to clipboard!`, "info");
  };

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "reference",
      header: "Transaction Reference",
      exportValue: (tx) => tx.reference,
      render: (tx) => {
        const isCredit = tx.type === "credit";
        return (
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isCredit
                  ? "bg-state-successbg text-state-success"
                  : "bg-surface-muted text-ink-900"
              }`}
            >
              {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <div className="min-w-0 max-w-[200px] sm:max-w-none">
              <p className="font-semibold text-ink-900 capitalize truncate">
                {tx.remark || tx.service_provider || "Platform Transfer"}
              </p>
              <p className="text-xs text-ink-900/50 font-mono truncate">{tx.reference}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "user",
      header: "User / Customer",
      exportValue: (tx: any) => tx.user?.name || "",
      render: (tx: any) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{tx.user?.name || "System / Guest"}</p>
          <p className="text-[11px] text-ink-900/50">{tx.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (tx) => `${tx.type === "credit" ? "+" : "-"}${formatNaira(tx.amount)}`,
      render: (tx) => {
        const isCredit = tx.type === "credit";
        return (
          <span
            className={`font-bold whitespace-nowrap ${
              isCredit ? "text-state-success" : "text-ink-900"
            }`}
          >
            {isCredit ? "+" : "-"}{formatNaira(tx.amount)}
          </span>
        );
      },
    },
    {
      key: "service_provider",
      header: "Provider",
      exportValue: (tx) => tx.service_provider || "",
      render: (tx) => (
        <span className="text-xs font-semibold text-ink-900/60 uppercase">
          {tx.service_provider || "Internal"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (tx) => tx.status,
      render: (tx) => <Badge status={tx.status as any} />,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (tx) => new Date(tx.created_at).toLocaleString(),
      render: (tx) => {
        const d = new Date(tx.created_at);
        return (
          <div className="whitespace-nowrap">
            <span className="text-ink-900/75 text-xs">{d.toLocaleDateString()}</span>
            <br />
            <span className="text-[11px] text-ink-900/40">
              {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (tx) => (
        <button
          onClick={() => setSelectedTx(tx)}
          className="btn-secondary py-1 px-2.5 text-xs shrink-0"
        >
          Details
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
            <ShieldCheck size={20} className="text-primary" /> Platform Transactions Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Audit all financial activities, bill payments, and user wallet movements across VistaPay.
          </p>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Successful Amount</p>
            <p className="text-lg font-extrabold text-ink-900 mt-0.5">{formatNaira(metrics.total_amount)}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Successful Txs</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.successful}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Pending Txs</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.pending}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-failed">
            <AlertCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Failed Txs</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.failed}</p>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6 space-y-5">
        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref, remark, user..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="input-field text-xs capitalize py-2.5"
          >
            <option value="">All Types (Credit/Debit)</option>
            <option value="credit">Credit (+)</option>
            <option value="debit">Debit (-)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="input-field text-xs capitalize py-2.5"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input-field text-xs py-2.5"
            placeholder="From Date"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input-field text-xs py-2.5"
            placeholder="To Date"
          />
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={transactions}
            fileName="admin-transactions"
            emptyLabel="No transactions found matching your criteria."
          />
        )}
      </div>

      {/* Side Drawer for Transaction Details */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Receipt className="text-primary" size={20} />
                <h3 className="font-bold text-ink-900">Transaction Audit</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {/* Amount Display Header */}
              <div className="rounded-xl bg-surface-muted p-4 text-center border border-surface-border">
                <p className="text-xs font-semibold text-ink-900/50 uppercase">
                  {selectedTx.type} Transaction
                </p>
                <p
                  className={`mt-1 text-2xl font-extrabold ${
                    selectedTx.type === "credit"
                      ? "text-state-success"
                      : "text-ink-900"
                  }`}
                >
                  {selectedTx.type === "credit" ? "+" : "-"}
                  {formatNaira(selectedTx.amount)}
                </p>
                <div className="mt-2 flex justify-center">
                  <Badge status={selectedTx.status as any} />
                </div>
              </div>

              {/* User Information Box */}
              {(selectedTx as any).user && (
                <div className="rounded-xl border border-surface-border p-4 space-y-2">
                  <h4 className="text-xs font-bold text-ink-900/40 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} /> Associated User
                  </h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-900/50">Name</span>
                    <span className="font-bold text-ink-900">{(selectedTx as any).user.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-900/50">Email</span>
                    <span className="font-medium text-ink-900">{(selectedTx as any).user.email}</span>
                  </div>
                </div>
              )}

              {/* Core Breakdown */}
              <div className="space-y-3 rounded-xl bg-surface-muted p-4 border border-surface-border text-xs">
                <DetailRow
                  label="Reference"
                  value={
                    <span
                      onClick={() =>
                        copyToClipboard(selectedTx.reference, "Reference")
                      }
                      className="flex items-center gap-1 cursor-pointer font-mono text-primary font-semibold hover:underline truncate max-w-[180px]"
                    >
                      <span className="truncate">{selectedTx.reference}</span> <Copy size={12} className="shrink-0" />
                    </span>
                  }
                />
                <DetailRow
                  label="Service Provider"
                  value={
                    <span className="uppercase font-semibold text-ink-900">
                      {selectedTx.service_provider || "Internal"}
                    </span>
                  }
                />
                <DetailRow
                  label="Transaction Fee"
                  value={formatNaira(selectedTx.charge)}
                />
                <DetailRow
                  label="Balance Before"
                  value={formatNaira(selectedTx.balance_before)}
                />
                <DetailRow
                  label="Balance After"
                  value={formatNaira(selectedTx.balance_after)}
                />
                <DetailRow
                  label="Date & Time"
                  value={new Date(selectedTx.created_at).toLocaleString()}
                />
                <DetailRow label="Remark" value={selectedTx.remark || "N/A"} />
              </div>

              {/* Extra Details Payload (If available) */}
              {selectedTx.details && typeof selectedTx.details === "object" && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink-900/40 uppercase tracking-wider">
                    Meta Information
                  </h4>
                  <div className="rounded-xl border border-surface-border p-4 space-y-2 text-xs bg-surface-muted/40">
                    {Object.entries(selectedTx.details).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center gap-2 capitalize"
                      >
                        <span className="text-ink-900/60 truncate">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="font-semibold text-ink-900 text-right truncate">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-surface-border bg-surface-muted/50">
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-secondary w-full py-2.5 text-xs"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between text-xs gap-3">
    <span className="text-ink-900/50 shrink-0">{label}</span>
    <span className="font-medium text-ink-900 text-right truncate">{value}</span>
  </div>
);