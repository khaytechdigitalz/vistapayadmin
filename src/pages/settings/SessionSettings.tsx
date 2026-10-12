import React, { useEffect, useState } from "react";
import { Monitor, Loader2, ChevronLeft, ChevronRight, Globe, Laptop, Smartphone, Tablet } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { SettingsNav } from "./SettingsNav";
import { LoginSessions } from "@/api/admin";

export interface UserLoginSession {
  id: number;
  user_id: number;
  ip_address: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  platform: string | null;
  device_type: "desktop" | "mobile" | "tablet" | string;
  device_name: string | null;
  user_agent: string;
  logged_in_at: string;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const SessionSettings: React.FC = () => {
  const { push } = useToast();

  const [sessions, setSessions] = useState<UserLoginSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  useEffect(() => {
    fetchSessions(pagination.current_page);
  }, [pagination.current_page]);

  const fetchSessions = async (page: number) => {
    try {
      setLoading(true);
      const res = await LoginSessions();

      if (res.status && res.data) {
        const paginatedData = res.data;
        setSessions(paginatedData.data || []);
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 10,
          total: paginatedData.total || 0,
        });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to load login sessions.";
      push(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Icon selector based on device type
  const renderDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return <Smartphone size={18} className="text-primary" />;
      case "tablet":
        return <Tablet size={18} className="text-primary" />;
      default:
        return <Laptop size={18} className="text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
      <SettingsNav />

      <div className="space-y-5">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <Monitor size={16} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900">Login Activity & Sessions</h3>
                <p className="text-xs text-ink-900/50">
                  Detailed view of active devices and recent logins to your account.
                </p>
              </div>
            </div>
            {pagination.total > 0 && (
              <span className="text-xs text-ink-900/50">
                Total: <strong className="text-ink-900">{pagination.total}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-900/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-xs">Loading login activity...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-900/40">
              No login history found.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {sessions.map((session, index) => {
                const isCurrent = pagination.current_page === 1 && index === 0;
                const locationStr = [session.city, session.country].filter(Boolean).join(", ");

                return (
                  <div key={session.id} className="flex items-start justify-between py-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted shrink-0">
                        {renderDeviceIcon(session.device_type)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-ink-900">
                            {session.device_name || `${session.platform} (${session.browser})`}
                          </p>
                          {isCurrent && (
                            <span className="pill bg-state-successbg text-state-success text-[10px] py-0.5 px-2">
                              Current session
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-ink-900/50 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Globe size={12} /> {session.ip_address}
                          </span>
                          {locationStr && <span>• {locationStr}</span>}
                          <span>• {formatDate(session.logged_in_at)}</span>
                        </div>

                        {/* User Agent String Tooltip / Small text */}
                        <p className="text-[10px] text-ink-900/40 font-mono break-all line-clamp-1 max-w-xl">
                          {session.user_agent}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && pagination.last_page > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-4">
              <span className="text-xs text-ink-900/50">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-ink-900 hover:bg-surface-muted disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-ink-900 hover:bg-surface-muted disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};