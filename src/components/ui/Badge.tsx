import React from "react";
import clsx from "clsx";

type Tone = "success" | "pending" | "failed" | "neutral";

const TONE_MAP: Record<Tone, string> = {
  success: "bg-state-successbg text-state-success",
  pending: "bg-state-pendingbg text-state-pending",
  failed: "bg-state-failedbg text-state-failed",
  neutral: "bg-surface-muted text-ink-900/70",
};

const STATUS_TONE: Record<string, Tone> = {
  success: "success",
  successful: "success",
  funding: "success",
  Paid: "success",
  Active: "success",
  Resolved: "success",
  closed: "success",
  pending: "pending",
  sent: "pending",
  open: "pending",
  "In Progress": "pending",
  Draft: "neutral",
  failed: "failed",
  Overdue: "failed",
  Revoked: "failed",
};

export const Badge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const tone = STATUS_TONE[status] ?? "neutral";
  return <span className={clsx("pill", TONE_MAP[tone], className)}>{status}</span>;
};
