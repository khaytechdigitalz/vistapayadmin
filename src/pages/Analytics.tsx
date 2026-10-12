import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Loader2, TrendingUp, Layers, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatNaira } from "@/lib/currency";
import { fetchAnalytics, Period, AnalyticsResponse, RemarkBreakdown } from "@/api/analytics";

const periods: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>("7d");
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse["data"] | null>(null);

  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  const loadAnalytics = async (selectedPeriod: Period) => {
    try {
      setLoading(true);
      const res = await fetchAnalytics(selectedPeriod);
      if (res.data) setAnalyticsData(res.data);
    } catch (err: any) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const growthTrend = analyticsData?.growth_trend || [];
  const remarkBreakdown = analyticsData?.remark_breakdown || [];
  const moneyFlow = analyticsData?.money_flow || [];

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/50">Current Balance</p>
            <p className="text-2xl font-extrabold text-ink-900 mt-1">
              {formatNaira(analyticsData?.current_balance || 0)}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary">
            <TrendingUp size={22} />
          </span>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/50">Total Received</p>
            <p className="text-2xl font-extrabold text-state-success mt-1">
              {formatNaira(analyticsData?.total_received || 0)}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-state-successbg text-state-success">
            <ArrowDownLeft size={22} />
          </span>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-900/50">Total Outflow</p>
            <p className="text-2xl font-extrabold text-state-error mt-1">
              {formatNaira(analyticsData?.total_spent || 0)}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-state-error">
            <ArrowUpRight size={22} />
          </span>
        </div>
      </div>

      {/* Volume Growth & Pie Breakdown */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-ink-900">Transaction Volume Trend</h3>
              <p className="text-xs text-ink-900/50">Overall financial activity over time</p>
            </div>
            <div className="flex gap-1.5 rounded-xl bg-surface-muted p-1">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    period === p.key ? "bg-primary text-white shadow-sm" : "text-ink-900/60 hover:text-ink-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthTrend}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
                width={60}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--chart-tooltip-border)",
                  backgroundColor: "var(--chart-tooltip-bg)",
                  color: "var(--chart-tooltip-text)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatNaira(value), "Volume"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--color-secondary-dark))"
                strokeWidth={3}
                dot={{ r: 3, fill: "rgb(var(--color-secondary-dark))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-1 font-bold text-ink-900">Service Category Share</h3>
          <p className="text-xs text-ink-900/50 mb-3">Breakdown by remark types</p>

          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={remarkBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                {remarkBreakdown.map((entry) => (
                  <Cell key={entry.remark} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--chart-tooltip-border)",
                  backgroundColor: "var(--chart-tooltip-bg)",
                  color: "var(--chart-tooltip-text)",
                  fontSize: 12,
                }}
                formatter={(value: number) => formatNaira(value)}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {remarkBreakdown.map((s) => (
              <div key={s.remark} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-900/70 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} /> {s.name}
                </span>
                <div className="text-right">
                  <p className="font-bold text-ink-900">{formatNaira(s.value)}</p>
                  <p className="text-[10px] text-ink-900/40">{s.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Money Flow Analysis Bar Chart */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink-900">15-Day Money Flow</h3>
            <p className="text-xs text-ink-900/50">Comparison of daily money credited vs debited</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-muted text-ink-900/60">
            Last 15 Days
          </span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={moneyFlow}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} width={60} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--chart-tooltip-border)",
                backgroundColor: "var(--chart-tooltip-bg)",
                fontSize: 12,
              }}
              formatter={(val: number) => formatNaira(val)}
            />
            <Bar dataKey="money_in" name="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="money_out" name="Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LOOPED INDIVIDUAL CHARTS FOR EACH REMARK CATEGORY */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Layers className="text-primary" size={20} />
          <h3 className="font-bold text-ink-900 text-lg">Detailed Category Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {remarkBreakdown.map((item: RemarkBreakdown) => (
            <div key={item.remark} className="card border border-surface-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <h4 className="font-bold text-ink-900 text-sm">{item.name}</h4>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-muted text-ink-900/60">
                  {item.remark}
                </span>
              </div>

              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <p className="text-lg font-extrabold text-ink-900">{formatNaira(item.value)}</p>
                  <p className="text-xs text-ink-900/50">{item.count} transactions</p>
                </div>
                <p className="text-xs font-bold text-primary">{item.percentage}% share</p>
              </div>

              {/* Category Time Series Line Graph */}
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={item.trend}>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--chart-tooltip-border)",
                      backgroundColor: "var(--chart-tooltip-bg)",
                      fontSize: 11,
                    }}
                    formatter={(val: number) => formatNaira(val)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={item.color}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};