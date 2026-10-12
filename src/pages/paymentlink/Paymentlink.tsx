import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Power, Loader2, Link as LinkIcon, Wallet,User, CheckCircle, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchPaymentLinks, togglePaymentLinkStatus, PaymentLink } from "@/api/paymentLinks";

export const PaymentLinks: React.FC = () => {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [metrics, setMetrics] = useState({ active_count: 0, inactive_count: 0, active_links_raised: 0 });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const res = await fetchPaymentLinks();
      if (res.status && res.data) {
        const linkData = res.data.payment_links;
        const rows = (linkData as any).data || linkData;
        setLinks(Array.isArray(rows) ? rows : []);
        setMetrics(res.data.metrics || { active_count: 0, inactive_count: 0, active_links_raised: 0 });
      }
    } catch (err: any) {
      push("Failed to load payment links", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await togglePaymentLinkStatus(id);
      if (res.status && res.data) {
        setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, is_active: res.data.is_active } : l)));
        push(res.message, "success");
        loadLinks(); // Refresh metrics summary
      }
    } catch (err: any) {
      push("Failed to change payment link status", "error");
    }
  };

  const columns: DataTableColumn<PaymentLink>[] = [
    {
      key: "owner",
      header: "Owner",
      exportValue: (l) => l.user?.name ?? "",
      render: (l) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User size={16} />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{l.user?.name ?? ""}</p>
            <p className="text-xs text-ink-900/50 font-mono"> {l.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "Payment Link",
      exportValue: (l) => l.title,
      render: (l) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LinkIcon size={16} />
          </span>
          <div>
            <p className="font-semibold text-ink-900">{l.title}</p>
            <p className="text-xs text-ink-900/50 font-mono">slug: {l.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Fixed Amount",
      exportValue: (l) => formatNaira(l.amount),
      render: (l) => <span className="font-bold text-ink-900">{formatNaira(l.amount)}</span>,
    },
    {
      key: "total_raised",
      header: "Total Raised",
      exportValue: (l) => formatNaira(l.total_raised || 0),
      render: (l) => <span className="font-bold text-state-success">{formatNaira(l.total_raised || 0)}</span>,
    },
    {
      key: "is_active",
      header: "Status",
      exportValue: (l) => (l.is_active ? "Active" : "Disabled"),
      render: (l) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${l.is_active ? "bg-state-successbg text-state-success" : "bg-surface-muted text-ink-900/50"}`}>
          {l.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (l) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/paymentlink/${l.id}`)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={() => handleToggle(l.id)}
            className={`rounded-lg border border-surface-border p-1.5 transition ${l.is_active ? "text-state-success hover:bg-state-successbg" : "text-ink-900/40 hover:bg-surface-muted"}`}
            title={l.is_active ? "Disable link" : "Enable link"}
          >
            <Power size={14} />
          </button>
        </div>
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
          <h3 className="font-bold text-ink-900 text-lg">Payment Links Oversight</h3>
          <p className="text-xs sm:text-sm text-ink-900/50">
            Monitor and audit all user-generated payment links across the platform.
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
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Active Links</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.active_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-border text-ink-900/50">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Inactive Links</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.inactive_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Total Raised (Active)</p>
            <p className="text-xl font-extrabold text-state-success mt-0.5">{formatNaira(metrics.active_links_raised)}</p>
          </div>
        </div>
      </div>

      {/* DataTable View */}
      <div className="card">
        <DataTable
          columns={columns}
          rows={links}
          fileName="admin-payment-links"
          emptyLabel="No payment links found."
          filters={{
            searchKeys: ["title", "slug"],
          }}
        />
      </div>
    </div>
  );
};