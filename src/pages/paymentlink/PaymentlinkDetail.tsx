import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  QrCode,
  Receipt,
  RefreshCw,
  Share2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchPaymentLinkDetails, PaymentLinkDetailsResponse } from "@/api/paymentLinks";

type PaymentRow = PaymentLinkDetailsResponse["payments"]["data"][number];

const QR_COLOR = "#0e3b39"; // matches the brand green used in the PDF export header

export const PaymentLinkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();

  const [data, setData] = useState<PaymentLinkDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const loadDetails = useCallback(
    async (linkId: string) => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetchPaymentLinkDetails(linkId);
        if (res.status && res.data) {
          setData(res.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
        push("Failed to load payment link details.", "error");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (id) loadDetails(id);
  }, [id, loadDetails]);

  const publicUrl = useMemo(
    () => (data ? `${window.location.origin}/paymentlink/checkout/${data.payment_link.slug}` : ""),
    [data]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      push("Payment link copied to clipboard!", "info");
    } catch {
      push("Couldn't copy automatically. Please copy the link manually.", "error");
    }
  };

  const shareLink = async () => {
    if (!data) return;
    try {
      await navigator.share({ title: data.payment_link.title, url: publicUrl });
    } catch {
      /* user dismissed the share sheet */
    }
  };

  /** Renders the on-screen SVG QR onto a padded white canvas and downloads it as a PNG. */
  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !data) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const qrSize = 1024;
      const pad = 96;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = qrSize + pad * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, pad, pad, qrSize, qrSize);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${data.payment_link.slug}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };
    img.onerror = () => push("Couldn't generate the QR image.", "error");
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  };

  /* ---------- states ---------- */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card mx-auto max-w-md space-y-3 p-8 text-center">
        <h2 className="text-lg font-bold text-ink-900">Couldn't load this payment link</h2>
        <p className="text-xs text-ink-900/60">Check your connection and try again.</p>
        <div className="flex justify-center gap-2 pt-1">
          <button onClick={() => navigate(-1)} className="btn-secondary py-2 text-xs">
            Go back
          </button>
          <button
            onClick={() => id && loadDetails(id)}
            className="btn-primary flex items-center gap-1.5 py-2 text-xs"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { payment_link, stats, payments } = data;
  const isActive = Boolean(payment_link.is_active);
  const conversion = stats.total_attempts > 0 ? Math.round((stats.successful_count / stats.total_attempts) * 100) : 0;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const paymentColumns: DataTableColumn<PaymentRow>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (p) => p.reference,
      render: (p) => <span className="font-mono text-xs font-semibold text-ink-900">{p.reference}</span>,
    },
    {
      key: "customer_name",
      header: "Customer",
      // Includes the email so the table's search box can find customers by either.
      exportValue: (p) => `${p.customer_name} (${p.customer_email})`,
      render: (p) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink-900">{p.customer_name}</p>
          <p className="break-all text-xs text-ink-900/50">{p.customer_email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (p) => formatNaira(p.amount),
      render: (p) => <span className="font-bold text-ink-900">{formatNaira(p.amount)}</span>,
    },
    {
      key: "account_number",
      header: "Virtual Account",
      exportValue: (p) => (p.account_number ? `${p.account_number} (${p.bank_name})` : "N/A"),
      render: (p) => (
        <span className="font-mono text-xs text-ink-900/70">
          {p.account_number ? `${p.account_number} (${p.bank_name})` : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (p) => p.status,
      render: (p) => <Badge status={p.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      // "YYYY-MM-DD HH:mm:ss" is reliably parseable, so the table's date-range filter works.
      exportValue: (p) => new Date(p.created_at).toLocaleString("sv-SE"),
      render: (p) => <span className="text-xs text-ink-900/60">{new Date(p.created_at).toLocaleString()}</span>,
    },
  ];

  const statCards = [
    {
      label: "Total raised",
      value: formatNaira(stats.total_raised),
      note: "From successful payments",
      icon: TrendingUp,
      tone: "text-state-success",
    },
    {
      label: "Successful",
      value: String(stats.successful_count),
      note: `${conversion}% of ${stats.total_attempts} attempt${stats.total_attempts === 1 ? "" : "s"}`,
      icon: CheckCircle2,
      tone: "text-ink-900",
    },
    {
      label: "Pending",
      value: String(stats.pending_count),
      note: "Awaiting transfer",
      icon: Clock,
      tone: "text-ink-900",
    },
    {
      label: "Failed",
      value: String(stats.failed_count),
      note: "Expired or unsuccessful",
      icon: XCircle,
      tone: "text-ink-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-ink-900/60 transition hover:text-ink-900"
      >
        <ArrowLeft size={16} /> Back to Payment Links
      </button>

      {/* Overview banner */}
      <div className="card relative overflow-hidden bg-primary p-5 text-white sm:p-6">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-white/50"}`} />
            {isActive ? "Active" : "Disabled"}
          </span>
          <h2 className="text-xl font-extrabold sm:text-2xl">{payment_link.title}</h2>
          {payment_link.description && <p className="max-w-xl text-xs text-white/80">{payment_link.description}</p>}
        </div>
        <div className="pointer-events-none absolute -bottom-4 right-4 opacity-10">
          <Receipt size={120} />
        </div>
      </div>

      {/* Share: link + QR */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* QR */}
          <div className="mx-auto shrink-0 sm:mx-0">
            <div
              ref={qrRef}
              className={`rounded-2xl border border-surface-border bg-white p-3 ${isActive ? "" : "opacity-40"}`}
            >
              <QRCodeSVG value={publicUrl} size={176} level="M" fgColor={QR_COLOR} bgColor="#ffffff" />
            </div>
          </div>

          {/* Details + actions */}
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <QrCode size={16} /> Share this link
              </h3>
              <p className="mt-1 text-xs text-ink-900/60">
                Customers can scan the code with their phone camera to open the checkout page, or you can send them the
                link.
              </p>
            </div>

            <div>
              <label className="label">Public link</label>
              <input
                readOnly
                value={publicUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="input-field truncate font-mono text-xs"
              />
            </div>

            {!isActive && (
              <p className="rounded-lg bg-surface-muted p-2.5 text-xs text-ink-900/60">
                This link is disabled, so scanning the code won't let customers pay.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={copyLink} className="btn-secondary flex items-center gap-1.5 py-2 text-xs">
                <Copy size={13} /> Copy link
              </button>
              <button onClick={downloadQr} className="btn-secondary flex items-center gap-1.5 py-2 text-xs">
                <Download size={13} /> Download QR
              </button>
              {canShare && (
                <button onClick={shareLink} className="btn-secondary flex items-center gap-1.5 py-2 text-xs">
                  <Share2 size={13} /> Share
                </button>
              )} 
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-ink-900/50">{label}</p>
              <Icon size={15} className="shrink-0 text-ink-900/30" />
            </div>
            <p className={`mt-1.5 break-words text-xl font-extrabold sm:text-2xl ${tone}`}>{value}</p>
            <p className="mt-1 text-[11px] text-ink-900/50">{note}</p>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div className="card space-y-4 p-4 sm:p-5">
        <h3 className="text-base font-bold text-ink-900">Payment history</h3>
        <DataTable
          columns={paymentColumns}
          rows={payments.data}
          fileName={`payment-link-${payment_link.id}-payments`}
          emptyLabel="No payment attempts recorded for this link yet."
          filters={{
            statusKey: "status",
            dateKey: "created_at",
            searchKeys: ["reference", "customer_name", "account_number"],
          }}
        />
      </div>
    </div>
  );
};
