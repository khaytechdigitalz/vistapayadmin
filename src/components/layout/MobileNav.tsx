import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Receipt, ArrowLeftRight, Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const sideItems = [
  { label: "Bills", path: "/app/bills", icon: Receipt },
  { label: "Transfer", path: "/app/transfer", icon: ArrowLeftRight },
];

const trailingItems = [
  { label: "Settings", path: "/app/settings/account", icon: Settings },
];

export const MobileNav: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-end justify-between rounded-2xl border border-surface-border surface-translucent px-2 pb-2 pt-2 shadow-card backdrop-blur lg:hidden">
        {sideItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition",
                isActive ? "text-primary" : "text-ink-900/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx("flex h-8 w-8 items-center justify-center rounded-xl", isActive && "bg-secondary")}>
                  <item.icon size={17} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Dashboard — elevated center button */}
        <div className="flex flex-1 flex-col items-center">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              clsx(
                "-mt-6 flex h-14 w-14 items-center justify-center rounded-full shadow-card ring-4 ring-white transition",
                isActive ? "bg-secondary text-primary-dark" : "bg-primary text-secondary"
              )
            }
          >
            <LayoutDashboard size={22} />
          </NavLink>
          <span className="mt-1 text-[10px] font-semibold text-ink-900/50">Home</span>
        </div>

        {trailingItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition",
                isActive ? "text-primary" : "text-ink-900/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx("flex h-8 w-8 items-center justify-center rounded-xl", isActive && "bg-secondary")}>
                  <item.icon size={17} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setLogoutOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold text-state-failed"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl">
            <LogOut size={17} />
          </span>
          Logout
        </button>
      </nav>

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={doLogout}
        title="Log out of VistaPay?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        tone="danger"
      />
    </>
  );
};
