import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Ban, CreditCard, Eye, EyeOff, Snowflake, Sun, Loader2, RefreshCw, User, Mail, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import {
  fetchCardDetails,
  fetchCardTransactions,
  freezeCard,
  unfreezeCard,
  terminateCard,
  VirtualCard,
  CardTransaction,
} from "@/api/cards";
import { formatNaira } from "@/lib/currency";

export const CardDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [card, setCard] = useState<VirtualCard | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  // Admin Modal Action States
  const [freezeConfirmOpen, setFreezeConfirmOpen] = useState(false);
  const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCardData(id);
    }
  }, [id]);

  const loadCardData = async (cardId: string) => {
    try {
      setLoading(true);
      const [cardRes, txRes] = await Promise.all([
        fetchCardDetails(cardId),
        fetchCardTransactions(cardId),
      ]);

      if (cardRes.status && cardRes.data) {
        setCard(cardRes.data);
      }
      if (txRes.status && txRes.data) {
        setTransactions(txRes.data);
      }
    } catch (err: any) {
      push("Failed to fetch card details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProvider = () => {
    if (id) {
      push("Syncing card balance with Payvessel...", "info");
      loadCardData(id);
    }
  };

  const toggleFreeze = async () => {
    if (!card) return;
    try {
      setActionLoading(true);
      setFreezeConfirmOpen(false);
      const res = card.status === "frozen"
        ? await unfreezeCard(card.id)
        : await freezeCard(card.id);

      if (res.status && res.data) {
        setCard(res.data);
        push(res.data.status === "frozen" ? "Card frozen successfully" : "Card unfrozen successfully", "success");
      } else {
        push(res.message || "Failed to update card status", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Status change failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!card) return;
    try {
      setActionLoading(true);
      setTerminateConfirmOpen(false);
      const res = await terminateCard(card.id);
      if (res.status && res.data) {
        setCard(res.data);
        push("Card terminated successfully.", "success");
      } else {
        push(res.message || "Failed to terminate card", "error");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Termination failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-ink-900/60">Virtual card not found.</p>
        <button onClick={() => navigate("/admin/cards")} className="btn-secondary mt-4">
          Back to Cards List
        </button>
      </div>
    );
  }

  const displayAmount = (n: number) =>
    card.currency === "USD" ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : formatNaira(n);

  const columns: DataTableColumn<CardTransaction>[] = [
    {
      key: "description",
      header: "Description",
      exportValue: (t) => t.description,
      render: (t) => <span className="font-medium text-ink-900">{t.description}</span>,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (t) => new Date(t.created_at).toLocaleString(),
      render: (t) => <span className="text-xs text-ink-900/70">{new Date(t.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (t) => `${t.type === "funding" || t.type === "refund" ? "+" : "-"}${displayAmount(t.amount)}`,
      render: (t) => {
        const isCredit = t.type === "funding" || t.type === "refund";
        return (
          <span className={`font-bold ${isCredit ? "text-state-success" : "text-ink-900"}`}>
            {isCredit ? "+" : "-"}{displayAmount(t.amount)}
          </span>
        );
      },
    },
    {
      key: "reference",
      header: "Reference",
      exportValue: (t) => t.reference,
      render: (t) => <span className="font-mono text-xs font-bold text-ink-900">{t.reference}</span>,
    },
    {
      key: "type",
      header: "Type",
      exportValue: (t) => t.type,
      render: (t) => <Badge status={t.type as any} />,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (t) => t.status,
      render: (t) => <Badge status={t.status as any} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <button
          onClick={() => navigate("/admin/cards")}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-900/60 hover:text-ink-900"
        >
          <ArrowLeft size={16} /> Back to Cards List
        </button>
        <button
          onClick={handleSyncProvider}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Sync Provider
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Visual Card & Administrative Actions */}
        <div className="space-y-5 lg:col-span-1">
          {/* Card Representation */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, #0E3B39, #0A2E2C)` }}
          >
            {card.status !== "active" && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold capitalize backdrop-blur">
                {card.status === "frozen" ? <Snowflake size={11} /> : <Ban size={11} />}
                {card.status}
              </span>
            )}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-white/70">{card.card_name || "Virtual Card"}</p>
              <CreditCard size={20} className="text-white/60" />
            </div>
            <p className="mb-2 text-xl font-mono font-semibold tracking-widest">
              {revealed ? (card.card_number || card.masked_card) : card.masked_card}
            </p>
            <div className="mb-5 flex items-center justify-between text-xs text-white/50 font-mono">
              <span className="uppercase">{card.card_type} ({card.currency})</span>
              <span>{card.expiration || "MM/YY"}</span>
            </div>
            <p className="rounded-xl bg-secondary px-4 py-2.5 text-base font-extrabold text-primary-dark">
              {displayAmount(card.balance)}
            </p>
          </div>

          {/* Toggle Reveal Card Details */}
          <div className="card">
            <button
              onClick={() => setRevealed((r) => !r)}
              className="flex w-full items-center justify-between rounded-xl border border-surface-border px-4 py-3 text-xs font-semibold text-ink-900 hover:bg-surface-muted transition"
            >
              <span className="flex items-center gap-2">
                {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                {revealed ? "Hide Full Card Details" : "Reveal Full Card Details"}
              </span>
            </button>
          </div>

          {/* Cardholder Information Panel */}
          <div className="card space-y-3 border border-surface-border">
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink-900/40 flex items-center gap-1.5">
              <User size={14} /> Cardholder Info
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-900/50">Name:</span>
                <span className="font-bold text-ink-900">{card.user?.name || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-900/50">Email:</span>
                <span className="font-medium text-ink-900">{card.user?.email || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-900/50">Phone:</span>
                <span className="font-medium text-ink-900">{card.user?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Admin Management Actions */}
          {card.status !== "terminated" && (
            <div className="card space-y-3 border border-surface-border">
              <h4 className="font-bold text-xs uppercase tracking-wider text-ink-900/40 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Admin Controls
              </h4>
              <button
                onClick={() => setFreezeConfirmOpen(true)}
                disabled={actionLoading}
                className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                {card.status === "frozen" ? <Sun size={15} /> : <Snowflake size={15} />}
                {card.status === "frozen" ? "Unfreeze Card" : "Freeze Card"}
              </button>
              <button
                onClick={() => setTerminateConfirmOpen(true)}
                disabled={actionLoading}
                className="btn-secondary w-full py-2.5 text-xs border-state-failed text-state-failed hover:bg-state-failedbg flex items-center justify-center gap-2"
              >
                <Ban size={15} /> Terminate Card
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Card Transactions Audit Log */}
        <div className="card lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-ink-900 text-base">Card Transactions & Provider Logs</h3>
            <p className="text-xs text-ink-900/50">Live transaction history synchronized with Payvessel.</p>
          </div>
          <DataTable
            columns={columns}
            rows={transactions}
            fileName={`admin-card-${card.masked_card}-transactions`}
            emptyLabel="No recorded transactions for this virtual card."
            filters={{ searchKeys: ["description", "reference"] }}
          />
        </div>
      </div>

      {/* Admin Action Confirmation Modals */}
      <ConfirmModal
        open={freezeConfirmOpen}
        onClose={() => setFreezeConfirmOpen(false)}
        onConfirm={toggleFreeze}
        title={card.status === "frozen" ? "Unfreeze this virtual card?" : "Freeze this virtual card?"}
        description={card.status === "frozen" ? "The user will immediately be allowed to authorize purchases with this card." : "All future authorizations on this card will be declined until unfrozen."}
        confirmLabel={card.status === "frozen" ? "Unfreeze Card" : "Freeze Card"}
        tone="primary"
      />

      <ConfirmModal
        open={terminateConfirmOpen}
        onClose={() => setTerminateConfirmOpen(false)}
        onConfirm={handleTerminate}
        title="Terminate virtual card?"
        description="This will permanently cancel the card with Payvessel and refund any remaining balance."
        confirmLabel="Terminate Card"
        tone="danger"
      />
    </div>
  );
};