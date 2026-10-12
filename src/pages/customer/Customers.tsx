import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, Wallet, Search, Eye, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchCustomers, updateCustomerStatus, Customer } from "@/api/customer";

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState({
    total_customers: 0,
    active_customers: 0,
    blocked_count: 0,
    total_wallets: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetchCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        per_page: 20,
      });

      if (res.status && res.data) {
        const custData = res.data.customers;
        const rows = Array.isArray(custData) ? custData : custData?.data || [];
        setCustomers(rows);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err: any) {
      push("Failed to load platform customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: "active" | "disabled" | "blocked") => {
    try {
      const res = await updateCustomerStatus(id, newStatus);
      if (res.status) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        push(`Customer status updated to ${newStatus}`, "success");
      }
    } catch (err: any) {
      push("Failed to update customer status", "error");
    }
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      exportValue: (c) => c.name,
      render: (c) => (
        <div>
          <p className="font-bold text-ink-900">{c.name}</p>
          <p className="text-xs text-ink-900/50">{c.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      exportValue: (c) => c.phone || "",
      render: (c) => <span className="text-xs text-ink-900/70">{c.phone || "N/A"}</span>,
    },
    {
      key: "wallet",
      header: "Wallet Balance",
      exportValue: (c) => c.wallet?.balance || 0,
      render: (c) => (
        <span className="font-bold text-ink-900">{formatNaira(c.wallet?.balance || 0)}</span>
      ),
    },
    {
      key: "kyc",
      header: "KYC Tier",
      exportValue: (c) => c.kyc?.current_level || 0,
      render: (c) => (
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/10 text-primary">
          Tier {c.kyc?.current_level || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      exportValue: (c) => c.status,
      render: (c) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            c.status === "active"
              ? "bg-state-successbg text-state-success"
              : c.status === "disabled"
              ? "bg-amber-500/10 text-amber-700"
              : "bg-state-failedbg text-state-error"
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      exportValue: (c) => new Date(c.created_at).toLocaleDateString(),
      render: (c) => <span className="text-xs text-ink-900/60">{new Date(c.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (c) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/customers/${c.id}`)}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
          >
            <Eye size={12} /> Profile
          </button>
          <select
            value={c.status}
            onChange={(e) => handleStatusChange(c.id, e.target.value as any)}
            className="input-field text-xs py-1 px-2 capitalize w-28"
          >
            <option value="active">Active</option>
            <option value="disabled">Disable</option>
            <option value="blocked">Block</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" /> Customer Management
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Monitor registered platform merchants, audit wallet balances, and control account access.
          </p>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Total Customers</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.total_customers}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <UserCheck size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Active Customers</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.active_customers}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Disabled</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.blocked_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-dark">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Total Wallets Float</p>
            <p className="text-lg font-extrabold text-ink-900 mt-0.5">{formatNaira(metrics.total_wallets)}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs capitalize py-2.5"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={customers}
            fileName="admin-customers"
            emptyLabel="No customers found."
            pageSize={20}
          />
        )}
      </div>
    </div>
  );
};