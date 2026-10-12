import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Wallet, X, LogOut } from "lucide-react";
import clsx from "clsx";
import { primaryNav, secondaryNav, tertiaryNav, wallettNav,digitalAssetNav,customerNav, transactionyNav, footerNav } from "./navConfig";
import { useAuth } from "@/context/AuthContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
    isActive ? "bg-secondary text-primary-dark font-bold" : "text-white/60 hover:bg-white/10 hover:text-white"
  );

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const Nav = (
    <div className="flex h-full flex-col border-r border-white/5 bg-primary px-4 py-6">
      <div className="mb-8 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary-dark">
            <Wallet size={16} />
          </span>
          <span className="text-base font-extrabold text-white">MetroPay V2</span>
        </div>
        <button onClick={onCloseMobile} className="text-white/60 lg:hidden">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {primaryNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
            {item.badge && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}


        <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          Wallet
        </p>
        {wallettNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}


        <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          Customer Management
        </p>
        {customerNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}


        <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          Digital Assets
        </p>
        {digitalAssetNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}


        <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          Transactions
        </p>
        {transactionyNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}


        <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          Account
        </p>
        {secondaryNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}

         <p className="px-3.5 pb-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-white/30">
          System Settings
        </p>
        {tertiaryNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
        {footerNav.map((item) => (
          <NavLink key={item.label} to={item.path} className={linkClasses} onClick={onCloseMobile}>
            <span className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </span>
          </NavLink>
        ))}
        <button
          onClick={() => {
            onCloseMobile();
            setLogoutOpen(true);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-white/10 hover:text-red-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{Nav}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="relative h-full w-64">{Nav}</div>
        </div>
      )}

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={doLogout}
        title="Log out of MetroPay?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        tone="danger"
      />
    </>
  );
};
