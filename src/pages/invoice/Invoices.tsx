import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, Trash2, Loader2, ShieldCheck, CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { generateInvoicePdf } from "@/lib/pdf";
import { fetchInvoices, deleteInvoice, Invoice } from "@/api/invoices";

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState({
    total_invoices: 0,
    total_paid: 0,
    total_pending: 0,
    paid_count: 0,
    overdue_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Deletion Confirmation Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetchInvoices();
      if (res.status && res.data) {
        const invData = res.data.invoices;
        const rows = Array.isArray(invData) ? invData : invData?.data || [];
        setInvoices(rows);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err: any) {
      push("Failed to load platform invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await deleteInvoice(invoiceToDelete.id);
      if (res.status) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete.id));
        push(`Invoice #${invoiceToDelete.number} deleted successfully`, "success");
      }
    } catch (err: any) {
      push("Failed to delete invoice", "error");
    } finally {
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "number",
      header: "Invoice",
      exportValue: (i) => `#${i.number}`,
      render: (i) => <span className="font-semibold text-ink-900">#{i.number}</span>,
    },
    {
      key: "user",
      header: "Creator / User",
      exportValue: (i: any) => i.user?.name || "",
      render: (i: any) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{i.user?.name || "System"}</p>
          <p className="text-[11px] text-ink-900/50">{i.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      exportValue: (i) => i.client,
      render: (i) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{i.client}</p>
          <p className="text-[11px] text-ink-900/50">{i.client_email || "No email"}</p>
        </div>
      ),
    },
    {
      key: "issue_date",
      header: "Issue Date",
      exportValue: (i) => i.issue_date,
      render: (i) => <span className="text-ink-900/70 text-xs">{i.issue_date}</span>,
    },
    {
      key: "due_date",
      header: "Due Date",
      exportValue: (i) => i.due_date,
      render: (i) => <span className="text-ink-900/70 text-xs">{i.due_date}</span>,
    },
    {
      key: "total",
      header: "Amount",
      exportValue: (i) => formatNaira(i.total),
      render: (i) => <span className="font-bold text-ink-900">{formatNaira(i.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (i) => i.status,
      render: (i) => <Badge status={i.status as any} />,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (i) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/invoices/${i.id}`)}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={() => generateInvoicePdf(i as any)}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
          >
            <Download size={12} /> PDF
          </button>
          <button
            onClick={() => {
              setInvoiceToDelete(i);
              setDeleteModalOpen(true);
            }}
            className="rounded-lg border border-surface-border p-1.5 text-state-failed hover:bg-state-failedbg transition"
          >
            <Trash2 size={13} />
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" /> Invoices Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Audit client invoices, monitor payment statuses, and review platform-wide billing activities.
          </p>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Total Invoices</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.total_invoices}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Paid Amount</p>
            <p className="text-lg font-extrabold text-ink-900 mt-0.5">{formatNaira(metrics.total_paid)}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Pending / Due</p>
            <p className="text-lg font-extrabold text-ink-900 mt-0.5">{formatNaira(metrics.total_pending)}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-failed">
            <AlertCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Overdue Invoices</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.overdue_count}</p>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <DataTable
          columns={columns}
          rows={invoices}
          fileName="admin-invoices"
          emptyLabel="No invoices found."
          filters={{
            statusKey: "status",
            dateKey: "issue_date",
            searchKeys: ["number", "client"],
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete invoice #${invoiceToDelete?.number}?`}
        description={`This action will permanently delete the invoice for ${invoiceToDelete?.client}. This cannot be undone.`}
        confirmLabel="Delete Invoice"
        tone="danger"
      />
    </div>
  );
};