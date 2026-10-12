import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, Legend } from "recharts";
import { ChartDataPoint } from "@/api/admin";
import { formatNaira } from "@/lib/currency";

interface MoneyFlowChartProps {
  compact?: boolean;
  chartData?: ChartDataPoint[];
}

export const MoneyFlowChart: React.FC<MoneyFlowChartProps> = ({ compact, chartData = [] }) => {
  // 1. Transform backend data for Recharts (Credit & Debit split)
  const formattedData = chartData.map((item) => {
    const rawDate = item.date;
    let label = rawDate;

    if (rawDate.includes(":")) {
      // e.g., "2026-10-06 14:00" -> "14:00"
      label = rawDate.split(" ")[1] || rawDate;
    } else if (rawDate.length === 10) {
      // e.g., "2026-10-06"
      const dateObj = new Date(rawDate + "T00:00:00");
      if (!isNaN(dateObj.getTime())) {
        // Formats as "Oct 6" for clarity across dates in a month
        label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } else if (rawDate.length === 7) {
      // e.g., "2026-10" -> "Oct"
      const [year, month] = rawDate.split("-");
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      if (!isNaN(dateObj.getTime())) {
        label = dateObj.toLocaleDateString("en-US", { month: "short" });
      }
    }

    return {
      label,
      rawDate,
      credit: parseFloat(item.credit_amount) || 0,
      debit: parseFloat(item.debit_amount) || 0,
      count: item.total_count,
    };
  });

  if (formattedData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-ink-900/40">
        No chart data available for this range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={compact ? 180 : 240}>
      <BarChart data={formattedData} barCategoryGap={compact ? "15%" : "20%"} barGap={4}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--chart-tooltip-border)",
            backgroundColor: "var(--chart-tooltip-bg)",
            color: "var(--chart-tooltip-text)",
            fontSize: 12,
            boxShadow: "0 8px 24px -12px rgba(10,46,44,0.2)",
          }}
          labelStyle={{ color: "var(--chart-tooltip-text)", fontWeight: "bold" }}
          formatter={(value: number, name: string) => [
            formatNaira(value),
            name === "credit" ? "Credit (Income)" : "Debit (Expense)",
          ]}
        />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
          formatter={(value: string) => (
            <span className="capitalize text-ink-900/70 font-medium">
              {value === "credit" ? "Income (Credit)" : "Expense (Debit)"}
            </span>
          )}
        />
        {/* Credit Bar (Income) */}
        <Bar
          dataKey="credit"
          name="credit"
          fill="rgb(var(--color-secondary, 99 102 241))"
          radius={[4, 4, 0, 0]}
        />
        {/* Debit Bar (Expenses) */}
        <Bar
          dataKey="debit"
          name="debit"
          fill="rgb(var(--color-primary, 99 102 241))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};