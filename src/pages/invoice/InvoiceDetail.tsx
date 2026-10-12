import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Mail, MapPin, Wallet, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { formatNaira } from "@/lib/currency";
import { generateInvoicePdf } from "@/lib/pdf";
import { fetchInvoiceById, Invoice } from "@/api/invoices";
import { useToast } from "@/context/ToastContext";

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoiceDetails(id);
    }
  }, [id]);

  const loadInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true);
      const res = await fetchInvoiceById(invoiceId);
      if (res.status && res.data) {
        setInvoice(res.data);
      }
    } catch (err: any) {
      push("Invoice details could not be retrieved.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-ink-900/60">Invoice not found.</p>
        <button
          onClick={() => navigate("/admin/invoices")}
          className="btn-secondary mt-4"
        >
          Back to Invoices List
        </button>
      </div>
    );
  }

  const items = invoice.items || [];
  const total = invoice.total || items.reduce((sum, it) => sum + (it.qty * it.rate), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/invoices")}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-900/60 hover:text-ink-900"
        >
          <ArrowLeft size={16} /> Back to Invoices List
        </button>
        <button
          onClick={() => generateInvoicePdf(invoice as any)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* Creator / Issuer Oversight Info Box */}
      {invoice.user && (
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User size={18} />
            </span>
            <div>
              <p className="text-xs text-ink-900/50 uppercase font-semibold">Invoice Creator</p>
              <p className="text-xs font-bold text-ink-900">{invoice.user.name} ({invoice.user.email})</p>
            </div>
          </div>
          <Badge status={invoice.status as any} />
        </div>
      )}

      <div className="card overflow-hidden !p-0 border border-surface-border">
        <div className="flex items-center justify-between bg-primary px-8 py-6 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary-dark">
              <Wallet size={18} />
            </span>
            <span className="text-xl font-extrabold">VistaPay Admin</span>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-white/60">Invoice</p>
            <p className="text-2xl font-extrabold">#{invoice.number}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="label">Invoiced To</p>
              <p className="font-bold text-ink-900">{invoice.client}</p>
              {invoice.client_email && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-900/50">
                  <Mail size={12} /> {invoice.client_email}
                </p>
              )}
              {invoice.client_address && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-900/50">
                  <MapPin size={12} className="mt-0.5 shrink-0" />{" "}
                  {invoice.client_address}
                </p>
              )}
            </div>

            <div>
              <p className="label">Dates</p>
              <p className="text-sm text-ink-900">
                <span className="text-ink-900/50">Issued:</span> {invoice.issue_date}
              </p>
              <p className="text-sm text-ink-900">
                <span className="text-ink-900/50">Due:</span> {invoice.due_date}
              </p>
              {!invoice.user && (
                <div className="mt-2">
                  <Badge status={invoice.status as any} />
                </div>
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <p className="label sm:text-right">Scan to Verify</p>
              <QrPlaceholder seed={invoice.number} size={80} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-xs font-semibold text-ink-900/50">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr
                    key={it.id || idx}
                    className="border-b border-surface-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {it.description}
                    </td>
                    <td className="px-4 py-3 text-center text-ink-900/70">
                      {it.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-900/70">
                      {formatNaira(it.rate)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-900">
                      {formatNaira(it.amount || (it.qty * it.rate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2 rounded-xl bg-surface-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-900/60">Subtotal</span>
                <span className="font-medium text-ink-900">
                  {formatNaira(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-900/60">Fee</span>
                <span className="font-medium text-ink-900">{formatNaira(0)}</span>
              </div>
              <div className="flex justify-between border-t border-surface-border pt-2 text-base">
                <span className="font-bold text-ink-900">Total</span>
                <span className="font-extrabold text-ink-900">
                  {formatNaira(total)}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-ink-900/60 border border-surface-border">
              <p className="mb-1 font-semibold text-ink-900">Notes</p>
              {invoice.notes}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-ink-900/40">
            Generated by VistaPay Administration Oversight.
          </p>
        </div>
      </div>
    </div>
  );
};