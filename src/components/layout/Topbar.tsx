import React, { useState } from "react";
import { ChevronDown, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { NotificationBell } from "@/components/ui/NotificationBell";

interface TopbarProps {
  title: string;
  onOpenMobile: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onOpenMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-surface-border surface-translucent px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobile} className="rounded-lg p-1.5 text-ink-900 lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-ink-900 sm:text-xl">{title}</h1>
      </div>

      <div className="hidden flex-1 max-w-sm items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-3.5 py-2.5 md:flex">
        <Search size={16} className="text-ink-900/40" />
        <input
          placeholder="Search transactions, invoices..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-900/40"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeSwitcher />
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-surface-border py-1.5 pl-1.5 pr-3 hover:bg-surface-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-secondary">
              {user?.name?.charAt(0) ?? "A"}
            </span>
            <span className="hidden text-sm font-semibold text-ink-900 sm:block">
              {user?.name?.split(" ")[0] ?? "User"} K.
            </span>
            <ChevronDown size={14} className="text-ink-900/50" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-surface-border bg-white p-1.5 shadow-card z-30">
              <button
                onClick={() => {
                  navigate("/app/settings/account");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-900 hover:bg-surface-muted"
              >
                <UserIcon size={16} /> Account Settings
              </button>
              <button
                onClick={() => {
                  navigate("/app/settings/security");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-900 hover:bg-surface-muted"
              >
                <Settings size={16} /> Security Settings
              </button>
              <div className="my-1 h-px bg-surface-border" />
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-state-failed hover:bg-state-failedbg"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
