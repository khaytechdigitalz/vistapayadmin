import React, { useEffect, useState } from "react";
import { Search, Loader2, Tag, Edit3, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import {
  fetchServicePlans,
  togglePlanStatus,
  toggleApiStatus,
  updateServicePlan,
  ServicePlan,
  PaginationLink,
} from "@/api/serviceprice";

export const BillsPricing: React.FC = () => {
  const { push } = useToast();

  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination metadata state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<PaginationLink[]>([]);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [apiStatusFilter, setApiStatusFilter] = useState<string>("");

  // Edit Drawer State
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    variation_code: "",
    fixed_price: 0,
    api_price: 0,
  });
  const [updating, setUpdating] = useState<boolean>(false);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, providerFilter, typeFilter, statusFilter, apiStatusFilter]);

  // Fetch plans whenever page or filters change
  useEffect(() => {
    loadPlans();
  }, [currentPage, search, providerFilter, typeFilter, statusFilter, apiStatusFilter]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetchServicePlans({
        page: currentPage,
        search: search || undefined,
        provider: providerFilter || undefined,
        type: typeFilter || undefined,
        status: statusFilter !== "" ? statusFilter : undefined,
        api_status: apiStatusFilter !== "" ? apiStatusFilter : undefined,
        per_page: 20,
      });

      if (res.status && res.data) {
        const paginatedData = res.data;
        const rows = paginatedData.data || [];
        
        const filteredRows = typeFilter
          ? rows.filter((p) => p.type?.toLowerCase() === typeFilter.toLowerCase())
          : rows;

        setPlans(filteredRows);
        setCurrentPage(paginatedData.current_page);
        setLastPage(paginatedData.last_page);
        setTotal(paginatedData.total);
        setLinks(paginatedData.links || []);
      }
    } catch (err: any) {
      push("Failed to load bills pricing plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (plan: ServicePlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name || "",
      variation_code: plan.variation_code || "",
      fixed_price: plan.variation_amount || 0,
      api_price:  plan.api_amount || 0,
    });
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setUpdating(true);
      const res = await updateServicePlan(editingPlan.id, editForm);
      if (res.status) {
        push(res.message || "Service plan updated successfully!", "success");
        setEditingPlan(null);
        loadPlans();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to update service plan.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (plan: ServicePlan) => {
    const newStatus = String(plan.status) === "1" || plan.status === "active" ? "0" : "1";
    try {
      const res = await togglePlanStatus(plan.id, newStatus);
      if (res.status) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, status: newStatus } : p))
        );
        push("Plan status updated successfully.", "success");
      }
    } catch (err: any) {
      push("Failed to update status.", "error");
    }
  };

  const handleToggleApiStatus = async (plan: ServicePlan) => {
    const newApiStatus = String(plan.api_status) === "1" || plan.api_status === "active" ? "0" : "1";
    try {
      const res = await toggleApiStatus(plan.id, newApiStatus);
      if (res.status) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, api_status: newApiStatus } : p))
        );
        push("API integration status updated successfully.", "success");
      }
    } catch (err: any) {
      push("Failed to update API status.", "error");
    }
  };

  const columns: DataTableColumn<ServicePlan>[] = [
    {
      key: "name",
      header: "Service Plan / Name",
      exportValue: (p) => p.name,
      render: (p) => (
        <div>
          <p className="font-bold text-ink-900">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-surface-muted text-ink-900/60">
              {p.type}
            </span>
            <span className="text-[11px] font-mono text-ink-900/50">{p.variation_code}</span>
          </div>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      exportValue: (p) => p.provider,
      render: (p) => (
        <span className="font-semibold text-xs uppercase px-2 py-1 rounded bg-primary/10 text-primary">
          {p.provider}
        </span>
      ),
    },
    {
      key: "pricing",
      header: "Pricing (Sell vs Cost)",
      exportValue: (p) => p.fixed_price,
      render: (p) => (
        <div className="text-xs">
          <p className="font-bold text-ink-900">Sell: {formatNaira( p.variation_amount || 0)}</p>
          <p className="text-[11px] text-ink-900/50">Cost: {formatNaira(  p.api_amount || 0)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Customer Status",
      exportValue: (p) => p.status,
      render: (p) => {
        const isActive = String(p.status) === "1" || p.status === "active";
        return (
          <button
            onClick={() => handleToggleStatus(p)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        );
      },
    },
    {
      key: "api_status",
      header: "API Integration",
      exportValue: (p) => p.api_status,
      render: (p) => {
        const isApiActive = String(p.api_status) === "1" || p.api_status === "active";
        return (
          <button
            onClick={() => handleToggleApiStatus(p)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isApiActive ? "bg-state-success" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isApiActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (p) => (
        <button
          onClick={() => handleOpenEdit(p)}
          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Edit3 size={13} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <Tag size={20} className="text-primary" /> Bills & Service Pricing Plans
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Manage bill payment service variations, pricing margins, and upstream API provider routing. Total: {total} plans
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 sm:p-6 space-y-4 border border-surface-border">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plan name, code..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="input-field text-xs uppercase py-2.5"
          >
            <option value="">All Providers</option>
            <option value="mtn">MTN</option>
            <option value="airtel">Airtel</option>
            <option value="glo">Globacom</option>
            <option value="etisalat">Etisalat</option>
            <option value="smile">Smile</option>
            <option value="gotv">GOTV</option>
            <option value="dstv">DSTV</option>
            <option value="startimes">Startimes</option>
            <option value="showmax">Showmax</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All Types</option>
            <option value="internet">Internet Data</option>
            <option value="cabletv">Cable TV</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All Customer Statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          <select
            value={apiStatusFilter}
            onChange={(e) => setApiStatusFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All API Statuses</option>
            <option value="1">API Active</option>
            <option value="0">API Disabled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={plans}
              fileName="admin-bills-pricing"
              emptyLabel="No pricing plans found matching your filters."
              pageSize={20}
            />

            {/* Laravel Server-Side Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-surface-border gap-3 text-xs">
              <p className="text-ink-900/60">
                Page <span className="font-bold text-ink-900">{currentPage}</span> of <span className="font-bold text-ink-900">{lastPage}</span> (Total: {total} items)
              </p>

              <div className="flex items-center gap-1.5 flex-wrap">
                {links.map((link, idx) => {
                  const isNumericLabel = !isNaN(Number(link.label));
                  const isEllipsis = link.label === "...";

                  if (isEllipsis) {
                    return (
                      <span key={idx} className="px-2.5 py-1 text-ink-900/40">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!link.page || link.active}
                      onClick={() => link.page && setCurrentPage(link.page)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        link.active
                          ? "bg-primary text-white"
                          : !link.page
                          ? "opacity-40 cursor-not-allowed bg-surface-muted text-ink-900/50"
                          : "bg-surface-muted text-ink-900/80 hover:bg-surface-border"
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- EDIT SIDE DRAWER --- */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <Edit3 className="text-primary" size={18} />
                <h3 className="font-bold text-ink-900 text-sm">Edit Service Plan</h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="rounded-xl bg-surface-muted p-3 border border-surface-border space-y-1">
                <p className="text-[11px] text-ink-900/50 uppercase font-semibold">Provider / Type</p>
                <p className="font-bold text-ink-900 uppercase">{editingPlan.provider} - {editingPlan.type}</p>
              </div>

              <div>
                <label className="font-medium text-ink-900/70">Plan Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-ink-900/70">Variation Code</label>
                <input
                  type="text"
                  value={editForm.variation_code}
                  onChange={(e) => setEditForm({ ...editForm, variation_code: e.target.value })}
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-ink-900/70">Customer Selling Price (Fixed Price ₦)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.fixed_price}
                  onChange={(e) => setEditForm({ ...editForm, fixed_price: Number(e.target.value) })}
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-ink-900/70">Upstream API Cost (API Price ₦)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.api_price}
                  onChange={(e) => setEditForm({ ...editForm, api_price: Number(e.target.value) })}
                  className="input-field mt-1 w-full text-xs"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};