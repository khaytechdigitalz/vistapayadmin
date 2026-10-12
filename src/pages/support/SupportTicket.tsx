import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, Search, ChevronRight, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { fetchAdminSupportTickets, AdminSupportTicketItem } from "@/api/support";

export const SupportTicketPage: React.FC = () => {
  const [tickets, setTickets] = useState<AdminSupportTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadTickets();
  }, [search, statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminSupportTickets({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.status && res.data) {
        setTickets(res.data);
      }
    } catch (err: any) {
      push("Failed to load customer support tickets.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <LifeBuoy size={20} className="text-primary" /> Support Desk
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Manage customer inquiries, investigate reported transaction issues, and reply to support tickets.
          </p>
        </div>
      </div>

      {/* Filter Bar & Ticket List Card */}
      <div className="card p-4 sm:p-6 space-y-4 border border-surface-border">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, subject, customer name or email..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Answered">Answered</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-900/40">
            No support tickets match your search criteria.
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/admin/support/${t.id}`)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-surface-muted/60 px-3 rounded-xl transition"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary">#{t.ticket_no}</span>
                    <p className="text-sm font-bold text-ink-900">{t.subject}</p>
                    <Badge status={t.status as any} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-900/60">
                    <span className="flex items-center gap-1 font-medium text-ink-900">
                      <User size={13} className="text-ink-900/40" /> {t.user?.name} ({t.user?.email})
                    </span>
                    <span>•</span>
                    <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium text-ink-900/70">{t.category}</span>
                    <span>•</span>
                    <span>Updated {t.lastUpdate}</span>
                  </div>
                </div>

                <ChevronRight size={18} className="shrink-0 text-ink-900/30" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};