import React, { useEffect, useState } from "react";
import { History, Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchHistory } from "@/api/userTransfer";

export const UserTransfer: React.FC = () => {
  const { push } = useToast();

  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUserTransfers();
  }, []);

  const loadUserTransfers = async () => {
    try {
      setLoading(true);
      const res = await fetchHistory();
      if (res.status && res.data) {
        const rows = (res.data as any).data || res.data;
        setTransfers(Array.isArray(rows) ? rows : []);
      }
    } catch (err: any) {
      push("Failed to load user transfer records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const transferColumns: DataTableColumn<any>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (t) => t.reference,
      render: (t) => <span className="font-mono text-xs font-bold text-ink-900">{t.reference}</span>,
    },
    {
      key: "sender",
      header: "Sender",
      exportValue: (t) => t.sender_name,
      render: (t) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{t.sender_name || "N/A"}</p>
          <p className="text-[11px] text-ink-900/50">{t.sender_email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "beneficiary",
      header: "Beneficiary (Recipient)",
      exportValue: (t) => t.beneficiary_name,
      render: (t) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{t.beneficiary_name || "N/A"}</p>
          <p className="text-[11px] text-ink-900/50">{t.beneficiary_email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      exportValue: (t) => t.amount,
      render: (t) => <span className="font-extrabold text-ink-900">{formatNaira(parseFloat(t.amount))}</span>,
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <History size={18} className="text-primary" /> User-to-User Transfer Records
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">Audit internal peer-to-peer wallet transfers across the platform.</p>
        </div>
        <button onClick={loadUserTransfers} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCcw size={14} /> Refresh Records
        </button>
      </div>

      {/* DataTable View */}
      <div className="card space-y-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={transferColumns}
            rows={transfers}
            fileName="user-transfer-history"
            emptyLabel="No user transfer records found."
            filters={{ searchKeys: ["reference", "sender_name", "sender_email", "beneficiary_name", "beneficiary_email"] }}
          />
        )}
      </div>
    </div>
  );
};