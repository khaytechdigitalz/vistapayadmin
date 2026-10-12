import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Eye, Loader2, Snowflake, Ban, CheckCircle, ShieldCheck } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchAllCards, VirtualCard } from "@/api/cards";

export const CardsList: React.FC = () => {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [metrics, setMetrics] = useState({ active_count: 0, frozen_count: 0, terminated_count: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCards();
      if (res.status && res.data) {
        const cardData = res.data.cards;
        const rows = (cardData as any).data || cardData;
        setCards(Array.isArray(rows) ? rows : []);
        setMetrics(res.data.metrics || { active_count: 0, frozen_count: 0, terminated_count: 0 });
      }
    } catch (err: any) {
      push("Failed to load virtual cards", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns: DataTableColumn<VirtualCard>[] = [
    {
      key: "masked_card",
      header: "Virtual Card",
      exportValue: (c) => c.masked_card,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard size={17} />
          </span>
          <div>
            <p className="font-mono font-bold text-ink-900">{c.masked_card}</p>
            <p className="text-xs text-ink-900/50">{c.card_name || "Virtual Card"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Cardholder",
      exportValue: (c) => c.user?.name || "",
      render: (c) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{c.user?.name || "N/A"}</p>
          <p className="text-[11px] text-ink-900/50">{c.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      exportValue: (c) => c.balance.toString(),
      render: (c) => (
        <span className="font-extrabold text-ink-900">
          {c.currency === "USD" ? `$${Number(c.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : formatNaira(c.balance)}
        </span>
      ),
    },
    {
      key: "card_type",
      header: "Type / Currency",
      exportValue: (c) => `${c.card_type} (${c.currency})`,
      render: (c) => (
        <span className="text-xs uppercase font-semibold text-ink-900/70">
          {c.card_type} <span className="font-mono text-primary">({c.currency})</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (c) => c.status,
      render: (c) => {
        const variant = c.status === "active" ? "success" : c.status === "frozen" ? "warning" : "failed";
        return <Badge status={variant as any} />;
      },
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (c) => (
        <button
          onClick={() => navigate(`/app/cards/${c.id}`)}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
        >
          <Eye size={13} /> View Details
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Virtual Cards Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Monitor and audit all user virtual cards, sync balances, and manage card statuses.
          </p>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <CheckCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Active Cards</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.active_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Snowflake size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Frozen Cards</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.frozen_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-failed">
            <Ban size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Terminated Cards</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.terminated_count}</p>
          </div>
        </div>
      </div>

      {/* DataTable View */}
      <div className="card">
        <DataTable
          columns={columns}
          rows={cards}
          fileName="admin-virtual-cards"
          emptyLabel="No virtual cards found."
          filters={{
            searchKeys: ["masked_card", "card_name"],
          }}
        />
      </div>
    </div>
  );
};