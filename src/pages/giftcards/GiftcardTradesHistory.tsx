import React, { useEffect, useState } from "react";
import { History, Loader2, RefreshCcw, CheckCircle, XCircle, Eye, X, ShieldCheck, Download, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { getImageSrc } from "@/lib/utils";
import {
  fetchGiftcardTrades,
  approveGiftcardTrade,
  rejectGiftcardTrade,
  GiftcardTrade,
} from "@/api/giftcard";

export const GiftcardTrades: React.FC = () => {
  const { push } = useToast();

  const [trades, setTrades] = useState<GiftcardTrade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Side-nav details modal state
  const [selectedTrade, setSelectedTrade] = useState<GiftcardTrade | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const res = await fetchGiftcardTrades();
      if (res.status && res.data) {
        const tradeData = res.data;
        const rows = (tradeData as any).data || tradeData;
        setTrades(Array.isArray(rows) ? rows : []);
      }
    } catch (err: any) {
      push("Failed to load giftcard trade history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (trade: GiftcardTrade) => {
    setSelectedTrade(trade);
    setAdminNotes(trade.admin_notes || "");
  };

  const handleApprove = async (tradeId: number) => {
    try {
      setActionLoading(true);
      const res = await approveGiftcardTrade(tradeId);
      if (res.status) {
        push("Giftcard trade approved and wallet credited successfully.", "success");
        setSelectedTrade(null);
        loadTrades();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to approve trade.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (tradeId: number) => {
    try {
      setActionLoading(true);
      const res = await rejectGiftcardTrade(tradeId, adminNotes);
      if (res.status) {
        push("Giftcard trade rejected successfully.", "success");
        setSelectedTrade(null);
        loadTrades();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to reject trade.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const tradeColumns: DataTableColumn<GiftcardTrade>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (t) => t.reference,
      render: (t) => <span className="font-mono text-xs font-bold text-ink-900">{t.reference}</span>,
    },
    {
      key: "giftcard",
      header: "Giftcard",
      exportValue: (t) => t.giftcard?.name || "",
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink-900">{t.giftcard?.name || "Giftcard"}</span>
          <span className="text-[10px] uppercase px-2 py-0.5 bg-surface-muted rounded font-semibold text-ink-900/60">{t.type}</span>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      exportValue: (t) => t.user?.name || "",
      render: (t) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{t.user?.name || "N/A"}</p>
          <p className="text-[11px] text-ink-900/50">{t.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "total_payable",
      header: "Total Payable",
      exportValue: (t) => t.total_payable.toString(),
      render: (t) => <span className="font-extrabold text-ink-900">{formatNaira(Number(t.total_payable))}</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (t) => t.status,
      render: (t) => <Badge status={t.status as any} />,
    },
    {
      key: "created_at",
      header: "Date",
      exportValue: (t) => t.created_at,
      render: (t) => <span className="text-xs text-ink-900/60">{new Date(t.created_at).toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (t) => (
        <button
          onClick={() => handleOpenDrawer(t)}
          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Eye size={13} /> Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <History size={18} className="text-primary" /> Giftcard Trade Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">Audit user giftcard uploads, review front/back card images, and process payouts.</p>
        </div>
        <button onClick={loadTrades} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCcw size={14} /> Refresh Records
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={tradeColumns}
            rows={trades}
            fileName="giftcard-trade-history"
            emptyLabel="No trade records found."
            filters={{ searchKeys: ["reference", "card_number"] }}
          />
        )}
      </div>

      {/* Side-Nav Details Drawer */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <h4 className="font-bold text-ink-900 text-base">Trade Inspection</h4>
              </div>
              <button
                onClick={() => setSelectedTrade(null)}
                className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {/* Financial & Trade Summary */}
              <div className="rounded-xl bg-surface-muted p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Reference</span>
                  <span className="font-mono font-bold text-ink-900">{selectedTrade.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Giftcard</span>
                  <span className="font-bold text-ink-900">{selectedTrade.giftcard?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Trade Type / Card Type</span>
                  <span className="font-semibold uppercase text-ink-900">{selectedTrade.type} ({selectedTrade.card_type || "Physical"})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Status</span>
                  <Badge status={selectedTrade.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Card Value (Amount)</span>
                  <span className="font-bold text-ink-900">${selectedTrade.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Exchange Rate</span>
                  <span className="font-semibold text-ink-900">{formatNaira(Number(selectedTrade.rate))}/$</span>
                </div>
                <div className="flex justify-between border-t border-surface-border pt-2">
                  <span className="text-ink-900/50 font-bold">Total Payable</span>
                  <span className="font-extrabold text-primary text-base">{formatNaira(Number(selectedTrade.total_payable))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-900/50">Date Submitted</span>
                  <span className="text-ink-900">{new Date(selectedTrade.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Card Number / Code Information */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Card Number / Pin</h5>
                <div className="rounded-xl border border-surface-border p-3 flex items-center gap-2 bg-surface-muted/30">
                  <CreditCard size={18} className="text-ink-900/40 shrink-0" />
                  <span className="font-mono font-bold text-ink-900 text-sm select-all">
                    {selectedTrade.card_number || "No Card Number Provided"}
                  </span>
                </div>
              </div>

              {/* Front Card Image */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Card Front Image</h5>
                <div className="rounded-xl border border-surface-border p-4 flex items-center justify-between gap-4">
                  {selectedTrade.card_image_front ? (
                    <>
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageSrc(selectedTrade.card_image_front)}
                          alt="Card Front"
                          className="h-16 w-16 rounded-2xl object-cover border border-surface-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/placeholder.png";
                          }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-ink-900">Front Upload</p>
                          <p className="text-[11px] text-ink-900/50">Front side of card</p>
                        </div>
                      </div>
                      <a
                        href={getImageSrc(selectedTrade.card_image_front)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Download size={14} /> Download
                      </a>
                    </>
                  ) : (
                    <span className="flex h-16 w-full items-center justify-center rounded-2xl bg-surface-muted text-xs font-semibold text-ink-900/50">
                      No Front Image Uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Back Card Image */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Card Back Image</h5>
                <div className="rounded-xl border border-surface-border p-4 flex items-center justify-between gap-4">
                  {selectedTrade.card_image_back ? (
                    <>
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageSrc(selectedTrade.card_image_back)}
                          alt="Card Back"
                          className="h-16 w-16 rounded-2xl object-cover border border-surface-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/placeholder.png";
                          }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-ink-900">Back Upload</p>
                          <p className="text-[11px] text-ink-900/50">Back side of card</p>
                        </div>
                      </div>
                      <a
                        href={getImageSrc(selectedTrade.card_image_back)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Download size={14} /> Download
                      </a>
                    </>
                  ) : (
                    <span className="flex h-16 w-full items-center justify-center rounded-2xl bg-surface-muted text-xs font-semibold text-ink-900/50">
                      No Back Image Uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Trader Information</h5>
                <div className="rounded-xl border border-surface-border p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-900/50">Name</span>
                    <span className="font-semibold text-ink-900">{selectedTrade.user?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-900/50">Email</span>
                    <span className="text-ink-900">{selectedTrade.user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-900/50">Phone</span>
                    <span className="text-ink-900">{selectedTrade.user?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Admin Notes Field */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-ink-900/40">Admin Review Notes</h5>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter audit remarks or rejection reasons..."
                  className="input-field min-h-[80px] py-2 text-xs resize-none"
                />
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-5 border-t border-surface-border bg-surface-muted/50 flex gap-3">
              {selectedTrade.status === "pending" || selectedTrade.status === "processing" ? (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReject(selectedTrade.id)}
                    className="btn-secondary flex-1 py-2 text-xs border-state-failed text-state-failed hover:bg-state-failedbg flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={15} />}
                    Reject Trade
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedTrade.id)}
                    className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={15} />}
                    Approve & Credit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="btn-secondary w-full py-2 text-xs"
                >
                  Close Drawer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};