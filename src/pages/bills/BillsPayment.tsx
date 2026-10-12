import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { formatNaira } from "@/lib/currency";
import { useToast } from "@/context/ToastContext";
import { fetchBillPayments, BillPaymentItem, BillPaymentQueryParams } from "@/api/bills";
import {
  X,
  Search,
  Loader2,
  Copy,
  Receipt,
  BarChart3,
  PieChart,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";
 
export const BillsPayment: React.FC = () => {
  const { push } = useToast();

  // Data & Pagination States
  const [bills, setBills] = useState<BillPaymentItem[]>([]);
  const [metrics, setMetrics] = useState({
    total_volume: 0,
    total_amount: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  });
  const [analytics, setAnalytics] = useState<{ timeline: any[]; remarks: any[] }>({ timeline: [], remarks: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<BillPaymentItem | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<"pending" | "success" | "failed" | "">("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    loadBills();
  }, [search, status, fromDate, toDate, page]);

  const loadBills = async () => {
  try {
    setLoading(true);
    const params: BillPaymentQueryParams = {
      search: search || undefined,
      status: (status as any) || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      page,
      per_page: 20,
    };

    const res = await fetchBillPayments(params);
    if (res.status && res.data) {
      const txData = res.data.transactions;
      const rows = Array.isArray(txData) ? txData : txData?.data || [];
      setBills(rows);
      
      if ((res.data as any).metrics) {
        setMetrics((res.data as any).metrics);
      }
      setAnalytics(res.data.analytics || { timeline: [], remarks: [] });
    }
  } catch (err: any) {
    push("Failed to load bill payment history.", "error");
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    push(`${label} copied to clipboard!`, "info");
  };

  const columns: DataTableColumn<BillPaymentItem>[] = [
    {
      key: "reference",
      header: "Transaction",
      exportValue: (b) => b.reference,
      render: (b) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
            <Receipt size={16} />
          </span>
          <div className="min-w-0 max-w-[200px] sm:max-w-none">
            <p className="font-semibold text-ink-900 capitalize truncate">
              {b.remark || "Bill Payment"}
            </p>
            <p className="text-xs text-ink-900/50 font-mono truncate">{b.reference}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Customer / User",
      exportValue: (b: any) => b.user?.name || "",
      render: (b: any) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{b.user?.name || "System / Guest"}</p>
          <p className="text-[11px] text-ink-900/50">{b.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (b) => formatNaira(b.amount),
      render: (b) => <span className="font-bold whitespace-nowrap text-ink-900">{formatNaira(b.amount)}</span>,
    },
    {
      key: "remark",
      header: "Category",
      exportValue: (b) => b.remark || "",
      render: (b) => (
        <span className="text-xs font-semibold text-ink-900/60 uppercase">
          {b.remark || "Utility"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (b) => b.status,
      render: (b) => <Badge status={b.status as any} />,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (b) => new Date(b.created_at).toLocaleString(),
      render: (b) => {
        const d = new Date(b.created_at);
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
      render: (b) => (
        <button
          onClick={() => setSelectedTx(b)}
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
            <ShieldCheck size={20} className="text-primary" /> Bill Payments Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Audit airtime, data, electricity, cable, and utility bill disbursements across the platform.
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
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Successful Bills</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.successful}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Pending Bills</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.pending}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-failed">
            <AlertCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Failed Bills</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.failed}</p>
          </div>
        </div>
      </div>

      {/* Analytics Summary Charts Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" /> Spending Timeline
            </h3>
            <span className="text-[11px] text-ink-900/40">Filtered Range</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {analytics.timeline.length > 0 ? (
              analytics.timeline.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-muted border border-surface-border">
                  <span className="font-medium text-ink-900/70">{item.date}</span>
                  <span className="font-bold text-ink-900">{formatNaira(item.total_amount)} ({item.count} txns)</span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-ink-900/40 py-8">No timeline analytics available.</p>
            )}
          </div>
        </div>

        <div className="card p-5 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2">
              <PieChart size={16} className="text-primary" /> Category Distribution
            </h3>
            <span className="text-[11px] text-ink-900/40">Grouped by Remark</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {analytics.remarks.length > 0 ? (
              analytics.remarks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-muted border border-surface-border">
                  <span className="font-medium text-ink-900/70 capitalize">{item.remark || "General"}</span>
                  <span className="font-bold text-ink-900">{formatNaira(item.total_amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-ink-900/40 py-8">No category analytics available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card with Filter Bar */}
      <div className="card p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, user, remark..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

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
            rows={bills}
            fileName="admin-bill-payments"
            emptyLabel="No bill payments found matching your criteria."
            pageSize={20}
          />
        )}
      </div>

      {/* Side Drawer for Bill Payment Details */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Receipt className="text-primary" size={20} />
                <h3 className="font-bold text-ink-900">Bill Payment Audit</h3>
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
                  Bill Disbursement
                </p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900">
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
                    <User size={13} /> Associated Customer
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
                      onClick={() => copyToClipboard(selectedTx.reference, "Reference")}
                      className="flex items-center gap-1 cursor-pointer font-mono text-primary font-semibold hover:underline truncate max-w-[180px]"
                    >
                      <span className="truncate">{selectedTx.reference}</span> <Copy size={12} className="shrink-0" />
                    </span>
                  }
                />
                <DetailRow
                  label="Category / Remark"
                  value={<span className="capitalize font-semibold text-ink-900">{selectedTx.remark || "N/A"}</span>}
                />
                <DetailRow
                  label="Transaction Fee"
                  value={formatNaira(selectedTx.charge || 0)}
                />
                {selectedTx.balance_before !== undefined && (
                  <DetailRow
                    label="Balance Before"
                    value={formatNaira(selectedTx.balance_before)}
                  />
                )}
                {selectedTx.balance_after !== undefined && (
                  <DetailRow
                    label="Balance After"
                    value={formatNaira(selectedTx.balance_after)}
                  />
                )}
                <DetailRow
                  label="Date & Time"
                  value={new Date(selectedTx.created_at).toLocaleString()}
                />
              </div>

              {/* Extra Details Payload / Meta Information */}
              {selectedTx.details && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink-900/40 uppercase tracking-wider">
                    Meta Information
                  </h4>
                  <div className="rounded-xl border border-surface-border p-4 space-y-3 text-xs bg-surface-muted/40">
                    {(() => {
                      let detailsObj = selectedTx.details;
                      if (typeof detailsObj === "string") {
                        try {
                          detailsObj = JSON.parse(detailsObj);
                        } catch (e) {
                          detailsObj = {};
                        }
                      }

                      if (!detailsObj || typeof detailsObj !== "object" || Object.keys(detailsObj).length === 0) {
                        return <p className="text-ink-900/40 text-center py-2">No metadata available.</p>;
                      }

                      return Object.entries(detailsObj).map(([key, rawVal]) => {
                        if (rawVal === null || rawVal === undefined) return null;

                        const formattedLabel = key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase());

                        const valString = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal);
                        const isTokenOrPin = key.toLowerCase().includes("token") || key.toLowerCase().includes("pin");

                        return (
                          <div key={key} className="flex justify-between items-center gap-4 text-xs">
                            <span className="text-ink-900/50 shrink-0 font-medium">
                              {formattedLabel}:
                            </span>

                            {isTokenOrPin ? (
                              <span
                                onClick={() => copyToClipboard(valString, formattedLabel)}
                                className="font-bold text-ink-900 cursor-pointer hover:text-primary transition truncate max-w-[200px]"
                                title="Click to copy"
                              >
                                {valString}
                              </span>
                            ) : (
                              <span className="font-semibold text-ink-900 text-right truncate max-w-[200px]">
                                {valString}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
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

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs gap-3">
    <span className="text-ink-900/50 shrink-0">{label}</span>
    <span className="font-medium text-ink-900 text-right truncate">{value}</span>
  </div>
);