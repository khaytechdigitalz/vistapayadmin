import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowLeftRight, ShieldAlert, Receipt, CheckCircle2, Loader2, Info } from "lucide-react";
import { apiClient } from "@/lib/axios";

export interface NotificationItem {
  id: string | number;
  title: string;
  body: string;
  type?: string;
  read_at: string | null;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("vservices/notifications?is_read=0");
      if (res.data.status && res.data.data) {
        // Handle pagination or direct array structure
        const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || [];
        setNotifications(list);
      }
    } catch (err) {
      // Fallback silently if offline or endpoint not reached
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((i) => !i.read_at).length;

  const getNotificationIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "transfer":
      case "credit":
      case "debit":
        return { icon: ArrowLeftRight, color: "#7FD1B9" };
      case "bill":
      case "utility":
        return { icon: Receipt, color: "#F3B65A" };
      case "security":
      case "alert":
        return { icon: ShieldAlert, color: "#E15252" };
      default:
        return { icon: CheckCircle2, color: "#0E7C66" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-surface-border p-2.5 text-ink-900 hover:bg-surface-muted transition"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-state-failed text-[9px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 sm:right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3 bg-surface-muted/30">
            <p className="text-sm font-bold text-ink-900">Notifications</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {unreadCount} new
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => {
                const isUnread = !n.read_at;
                const { icon: IconComponent, color } = getNotificationIcon(n.type);

                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 border-b border-surface-border px-4 py-3 last:border-0 hover:bg-surface-muted/50 transition"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}22`, color: color }}
                    >
                      <IconComponent size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-ink-900 truncate">{n.title}</p>
                        {isUnread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-ink-900/60 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-[10px] text-ink-900/40">
                        {formatTimeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-ink-900/40">
                No notifications found.
              </div>
            )}
          </div>

          <Link
            to="/app/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-surface-border px-4 py-3 text-center text-xs font-bold text-primary hover:bg-surface-muted transition"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};