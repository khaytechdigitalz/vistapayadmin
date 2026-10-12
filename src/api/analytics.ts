import { apiClient } from "@/lib/axios";

export type Period = "today" | "7d" | "month" | "year";

export interface TrendPoint {
  label: string;
  credit: number;
  debit: number;
  value: number;
}

export interface RemarkBreakdown {
  remark: string;
  name: string;
  type: "credit" | "debit";
  count: number;
  value: number;
  charge: number;
  percentage: number;
  color: string;
  trend: { label: string; value: number }[];
}

export interface MoneyFlowPoint {
  date: string;
  money_in: number;
  money_out: number;
}

export interface AnalyticsResponse {
  status: boolean;
  message: string;
  data: {
    period: Period;
    current_balance: number;
    total_spent: number;
    total_received: number;
    growth_trend: TrendPoint[];
    remark_breakdown: RemarkBreakdown[];
    money_flow: MoneyFlowPoint[];
  };
}

export async function fetchAnalytics(period: Period = "7d"): Promise<AnalyticsResponse> {
  const res = await apiClient.get("/analytics", { params: { period } });
  return res.data;
}