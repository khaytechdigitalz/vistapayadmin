import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Send,
  FileText,
  Grid2x2,
  Loader2,
  ArrowDownLeft,
  Users,
  UserCheck,
  UserX,
  Globe,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { MoneyFlowChart } from "@/components/ui/MoneyFlowChart";
import { Badge } from "@/components/ui/Badge";
import { formatNaira } from "@/lib/currency";
import { fetchDashboard, DashboardData } from "@/api/admin";
import { useToast } from "@/context/ToastContext";

const filterOptions = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "This Month", value: "this-month" },
  { label: "This Year", value: "this-year" },
];

const statColors = ["bg-primary", "bg-secondary", "bg-surface-border", "bg-state-success"];

export const Dashboard: React.FC = () => {
  const { push } = useToast?.() || { push: (msg: string) => alert(msg) };
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>("7days");
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  const loadDashboard = async (filter: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setChartLoading(true);

    try {
      const res = await fetchDashboard(filter);
      if (res.status && res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
      push("Failed to load dashboard metrics.", "error");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(activeFilter, true);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    loadDashboard(filter, false);
  };

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { users_overview, demographics, system_wallet, recent_transactions, transaction_chart, transaction_stats } = data;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {/* Main Content Area */}
      <div className="space-y-5 xl:col-span-2">
        {/* User Overview Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card p-4 space-y-1">
            <span className="text-xs font-semibold text-ink-900/50 flex items-center gap-1.5">
              <Users size={14} className="text-primary" /> Total Customers
            </span>
            <p className="text-xl font-extrabold text-ink-900">{users_overview.total_customers}</p>
            <span className="text-[10px] text-state-success font-semibold">Active Base</span>
          </div>

          <div className="card p-4 space-y-1">
            <span className="text-xs font-semibold text-ink-900/50 flex items-center gap-1.5">
              <UserCheck size={14} className="text-state-success" /> Active Users
            </span>
            <p className="text-xl font-extrabold text-state-success">{users_overview.active_users}</p>
            <span className="text-[10px] text-ink-900/50">Status: Active</span>
          </div>

          <div className="card p-4 space-y-1">
            <span className="text-xs font-semibold text-ink-900/50 flex items-center gap-1.5">
              <UserX size={14} className="text-red-500" /> Inactive Users
            </span>
            <p className="text-xl font-extrabold text-ink-900">{users_overview.inactive_users}</p>
            <span className="text-[10px] text-red-500 font-semibold">Restricted/Suspended</span>
          </div>

          <div className="card p-4 space-y-1">
            <span className="text-xs font-semibold text-ink-900/50 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-secondary" /> This Month
            </span>
            <p className="text-xl font-extrabold text-ink-900">{users_overview.registered_this_month}</p>
            <span className="text-[10px] text-ink-900/50">New Signups</span>
          </div>
        </div>

        {/* System Wallets Balance Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="widget-secondary rounded-xl2 p-6">
            <p className="text-xs font-semibold text-ink-900/50">Total System Balance</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900">
              {formatNaira(system_wallet.total_balance)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-state-success">
              <ArrowUpRight size={13} /> Aggregated User Wallets
            </p>
          </div>
          <div className="widget-primary rounded-xl2 p-6">
            <p className="text-xs font-semibold text-ink-900/50">Total Pending Balance</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900">
              {formatNaira(system_wallet.total_pending_balance)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-900/40">
              Platform uncleared escrow funds
            </p>
          </div>
        </div>

        {/* Money Flow Chart */}
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-ink-900">Platform Transaction Volume</h3>
            <div className="flex items-center gap-1 rounded-xl border border-surface-border p-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange(opt.value)}
                  disabled={chartLoading}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    activeFilter === opt.value
                      ? "bg-primary text-white"
                      : "text-ink-900/60 hover:text-ink-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {chartLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <MoneyFlowChart chartData={transaction_chart} />
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink-900">Recent System Transactions</h3>
            <Link to="/admin/transactions" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {recent_transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-900/50">No recent transactions found.</p>
            ) : (
              recent_transactions.map((tx) => {
                const isCredit = tx.type === "credit";
                const amountNum = parseFloat(tx.amount);

                return (
                  <div key={tx.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isCredit ? "bg-state-success/10 text-state-success" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold capitalize text-ink-900">{tx.remark}</p>
                        <p className="text-xs text-ink-900/50">
                          {tx.user?.name ? `${tx.user.name} (${tx.user.email})` : `User ID: ${tx.user_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="hidden text-right text-xs text-ink-900/50 sm:block">
                      <p>{new Date(tx.created_at).toLocaleDateString()}</p>
                      <p>{new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <p className={`text-sm font-bold ${isCredit ? "text-state-success" : "text-ink-900"}`}>
                      {isCredit ? "+" : "-"}{formatNaira(amountNum)}
                    </p>
                    <Badge status={tx.status} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Area: Demographics & Statistics */}
      <div className="space-y-5">
        {/* User Login Demography - Country */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-900 flex items-center gap-2">
              <Globe size={16} className="text-primary" /> Top Countries
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-900/50">Logins</span>
          </div>
          <div className="space-y-2.5">
            {demographics.by_country.length === 0 ? (
              <p className="text-xs text-ink-900/50">No country demography recorded.</p>
            ) : (
              demographics.by_country.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-900/80">{item.country || "Unknown"}</span>
                  <span className="font-bold rounded-full bg-surface-muted px-2 py-0.5 text-ink-900">{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Login Demography - Browser */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-900 flex items-center gap-2">
              <Monitor size={16} className="text-primary" /> Top Browsers
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-900/50">Logins</span>
          </div>
          <div className="space-y-2.5">
            {demographics.by_browser.length === 0 ? (
              <p className="text-xs text-ink-900/50">No browser demography recorded.</p>
            ) : (
              demographics.by_browser.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-900/80">{item.browser || "Unknown"}</span>
                  <span className="font-bold rounded-full bg-surface-muted px-2 py-0.5 text-ink-900">{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Statistics by Remark */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink-900">Transaction Remarks</h3>
            <span className="text-xs font-bold text-primary capitalize">Overview</span>
          </div>
          <div className="space-y-3">
            {Object.keys(transaction_stats).length === 0 ? (
              <p className="text-xs text-ink-900/50">No transaction statistics available.</p>
            ) : (
              Object.values(transaction_stats).map((stat, idx) => (
                <div key={stat.remark} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-900/70 capitalize">
                    <span className={`h-2.5 w-2.5 rounded-full ${statColors[idx % statColors.length]}`} />
                    {stat.remark} ({stat.total_count})
                  </span>
                  <span className="font-bold text-ink-900">
                    {formatNaira(parseFloat(stat.total_amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};