import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Search, 
  Calendar, 
  Filter, 
  Loader2, 
  ArrowUpRight 
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { fetchSystemEarnings, EarningsMetrics, ServiceBreakdownItem, TransactionAuditItem } from "@/api/systemearning";

export const AdminEarningsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<EarningsMetrics | null>(null);
  const [breakdown, setBreakdown] = useState<ServiceBreakdownItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<TransactionAuditItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const { push } = useToast();

  useEffect(() => {
    loadEarningsData();
  }, [search, serviceType, fromDate, toDate, currentPage]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const res = await fetchSystemEarnings({
        search: search || undefined,
        remark: serviceType || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page: currentPage,
      });

      if (res.status && res.data) {
        setMetrics(res.data.metrics);
        setBreakdown(res.data.breakdown_by_service);
        setAuditLogs(res.data.audit_logs.data);
        setLastPage(res.data.audit_logs.last_page);
      }
    } catch (err: any) {
      push("Failed to load system earnings and audit logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setServiceType("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <TrendingUp size={22} className="text-primary" /> System Earnings & Fee Audit
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Monitor platform revenue, transaction fee collections, and successful volume audits.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Fees Earned */}
        <div className="card p-5 border border-surface-border bg-surface-muted/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/60 uppercase tracking-wider">Total Fees Earned</p>
            <h4 className="text-2xl font-extrabold text-primary mt-1">
              ₦{metrics ? metrics.total_fees_earned.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
            </h4>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DollarSign size={22} />
          </span>
        </div>

        {/* Total Processed Volume */}
        <div className="card p-5 border border-surface-border bg-surface-muted/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/60 uppercase tracking-wider">Successful Volume</p>
            <h4 className="text-2xl font-extrabold text-ink-900 mt-1">
              ₦{metrics ? metrics.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
            </h4>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-ink-900/70">
            <Activity size={22} />
          </span>
        </div>

        {/* Successful Transactions Count */}
        <div className="card p-5 border border-surface-border bg-surface-muted/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/60 uppercase tracking-wider">Successful Txs</p>
            <h4 className="text-2xl font-extrabold text-ink-900 mt-1">
              {metrics ? metrics.total_successful.toLocaleString() : "0"}
            </h4>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/20 text-secondary-dark">
            <ArrowUpRight size={22} />
          </span>
        </div>
      </div>

      {/* Service Breakdown Summary */}
      {breakdown.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {breakdown.map((item) => (
            <div key={item.remark} className="card p-3.5 border border-surface-border bg-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-900/50">{item.remark || "General"}</p>
              <p className="text-base font-bold text-primary mt-1">₦{Number(item.total_fees).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-ink-900/60 mt-0.5">{item.count} transactions (Vol: ₦{Number(item.total_volume).toLocaleString()})</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="card p-4 space-y-3 border border-surface-border">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, remark..."
              className="input-field pl-9 text-xs py-2.5 w-full"
            />
          </div>

          {/* Service Type Dropdown */}
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All Services</option>
            <option value="payout">Bank Transfer</option>
            <option value="collection">Deposit</option>
            <option value="airtime">Airtime</option>
            <option value="cabletv">Cabletv</option>
            <option value="insurance">Insurance</option>
            <option value="internet">Internet Data</option>
            <option value="utility">Electricity Utility</option>
            <option value="giftcard">Giftcard</option>
            <option value="vitualcard">Vitualcard</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field text-xs py-2.5 w-full"
              title="From Date"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field text-xs py-2.5 w-full"
              title="To Date"
            />
          </div>
        </div>

        {(search || serviceType || fromDate || toDate) && (
          <div className="flex justify-end pt-1">
            <button onClick={handleResetFilters} className="text-xs text-primary font-semibold hover:underline">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="card p-0 border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-surface-muted/20 flex items-center justify-between">
          <h4 className="font-bold text-ink-900 text-sm">Transaction Fee Audit Logs</h4>
          <span className="text-xs text-ink-900/50">Showing successful audit trails</span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-900/40">
            No transaction fee audit records found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted/50 text-ink-900/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Reference / Service</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount (₦)</th>
                  <th className="p-3">Fee Earned (₦)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remark</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {auditLogs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-muted/30 transition">
                    <td className="p-3">
                      <span className="font-mono font-bold text-primary">#{tx.reference}</span>
                      <p className="text-[11px] text-ink-900/50 capitalize">{tx.remark || "General"}</p>
                    </td>
                    <td className="p-3 font-semibold capitalize text-ink-900">{tx.type}</td>
                    <td className="p-3 font-medium text-ink-900">₦{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 font-bold text-primary">₦{Number(tx.charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3">
                      <Badge status="success" />
                    </td>
                    <td className="p-3 text-ink-900/70 max-w-xs truncate" title={tx.remark}>{tx.remark || "N/A"}</td>
                    <td className="p-3 text-right text-ink-900/60 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <div className="p-4 border-t border-surface-border flex items-center justify-between bg-surface-muted/10">
            <p className="text-xs text-ink-900/60">Page {currentPage} of {lastPage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};