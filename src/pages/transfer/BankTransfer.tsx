import React, { useEffect, useState } from "react";
import {
  History,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import {
  deleteBeneficiary,
  fetchPayoutHistory,
  fetchBeneficiaries,
  Beneficiary,
} from "@/api/payouts";

type ActiveTab = "history" | "beneficiaries";

export const BankTransfer: React.FC = () => {
  const { push } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingHistory(true);
      const [historyRes, benRes] = await Promise.all([
        fetchPayoutHistory(),
        fetchBeneficiaries(),
      ]);

      if (historyRes.data) {
        const rows = (historyRes.data as any).data || historyRes.data;
        setPayoutHistory(Array.isArray(rows) ? rows : []);
      }

      if (benRes.data) {
        const benRows = (benRes.data as any).data || benRes.data;
        setBeneficiaries(Array.isArray(benRows) ? benRows : []);
      }
    } catch (err: any) {
      push("Failed to load payout data.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadPayoutHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetchPayoutHistory();
      const rows = (res.data as any)?.data || res.data;
      setPayoutHistory(Array.isArray(rows) ? rows : []);
    } catch (err) {
      push("Failed to load payout history.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      const res = await fetchBeneficiaries();
      const rows = (res.data as any)?.data || res.data;
      setBeneficiaries(Array.isArray(rows) ? rows : []);
    } catch (err) {
      push("Failed to load beneficiaries.", "error");
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const handleDeleteBeneficiary = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteBeneficiary(id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      push("Beneficiary deleted successfully.", "success");
    } catch (err: any) {
      push("Failed to delete beneficiary.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const historyColumns: DataTableColumn<any>[] = [
    {
      key: "reference",
      header: "Reference",
      exportValue: (t) => t.reference,
      render: (t) => <span className="font-mono text-xs font-bold text-ink-900">{t.reference}</span>,
    },
    {
      key: "details",
      header: "Recipient",
      exportValue: (t) => t.reference,
      render: (t) => {
        const details = typeof t.details === "string" ? JSON.parse(t.details || "{}") : t.details || {};
        return (
          <div>
            <p className="text-xs font-bold text-ink-900">{details.account_name || t.user?.name || "N/A"}</p>
            <p className="text-[11px] text-ink-900/50">{details.account_number} • {details.bank_name || t.service_provider}</p>
          </div>
        );
      },
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

  const beneficiaryColumns: DataTableColumn<Beneficiary>[] = [
    {
      key: "account_owner",
      header: "Account Owner",
      exportValue: (b) => b.user?.name ?? "",
      render: (b) => <span className="text-xs font-bold text-ink-900">{b.user?.name ?? null}</span>,
    },
    {
      key: "account_name",
      header: "Account Name",
      exportValue: (b) => b.account_name,
      render: (b) => <span className="text-xs font-bold text-ink-900">{b.account_name}</span>,
    },
    {
      key: "account_number",
      header: "Account Number",
      exportValue: (b) => b.account_number,
      render: (b) => <span className="font-mono text-xs font-semibold text-primary">{b.account_number}</span>,
    },
    {
      key: "bank_name",
      header: "Bank Name",
      exportValue: (b) => b.bank_name,
      render: (b) => <span className="text-xs text-ink-900/70">{b.bank_name}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: (b) => b.id.toString(),
      render: (b) => (
        <button
          onClick={() => handleDeleteBeneficiary(b.id)}
          disabled={deletingId === b.id}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
          title="Delete Beneficiary"
        >
          {deletingId === b.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg">Bank Payouts & Beneficiaries</h3>
          <p className="text-xs sm:text-sm text-ink-900/55">Track payout transactions and manage saved beneficiaries.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-surface-muted p-1">
          <button
            onClick={() => {
              setActiveTab("history");
              loadPayoutHistory();
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "history" ? "bg-primary text-white shadow-sm" : "text-ink-900/60 hover:text-ink-900"
            }`}
          >
            <History size={14} /> Payout History
          </button>
          <button
            onClick={() => {
              setActiveTab("beneficiaries");
              loadBeneficiaries();
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "beneficiaries" ? "bg-primary text-white shadow-sm" : "text-ink-900/60 hover:text-ink-900"
            }`}
          >
            <Users size={14} /> Beneficiaries
          </button>
        </div>
      </div>

      {/* TAB 1: PAYOUT HISTORY */}
      {activeTab === "history" && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-900 text-base">Payout Transaction History</h3>
            <button onClick={loadPayoutHistory} className="btn-secondary py-1.5 px-3 text-xs">
              Refresh
            </button>
          </div>
          {loadingHistory ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={historyColumns}
              rows={payoutHistory}
              fileName="payout-history"
              emptyLabel="No payout transfers found."
            />
          )}
        </div>
      )}

      {/* TAB 2: BENEFICIARIES */}
      {activeTab === "beneficiaries" && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-900 text-base">Saved Beneficiaries</h3>
            <button onClick={loadBeneficiaries} className="btn-secondary py-1.5 px-3 text-xs">
              Refresh
            </button>
          </div>
          {loadingBeneficiaries ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              columns={beneficiaryColumns}
              rows={beneficiaries}
              fileName="beneficiaries-list"
              emptyLabel="No beneficiaries saved yet."
              filters={{ searchKeys: ["account_name", "account_number", "bank_name"] }}
            />
          )}
        </div>
      )}
    </div>
  );
};