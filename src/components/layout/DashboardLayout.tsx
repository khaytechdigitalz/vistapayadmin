import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { primaryNav, secondaryNav, footerNav } from "./navConfig";

const allNav = [
  ...primaryNav,
  ...secondaryNav,
  ...footerNav,
  { label: "Deposit", path: "/app/deposit" },
  { label: "Checkout", path: "/app/checkout" },
  { label: "New Card", path: "/app/cards/new" },
];

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const current = [...allNav]
    .filter((item) => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={current?.label ?? "Dashboard"} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 pb-28 sm:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
