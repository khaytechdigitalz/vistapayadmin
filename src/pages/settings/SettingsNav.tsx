import React from "react";
import { NavLink } from "react-router-dom";
import { Settings, ShieldCheck, KeyRound, BadgeCheck, Lock } from "lucide-react";
import clsx from "clsx";

const items = [
  { label: "Account", path: "/app/settings/account", icon: Settings },
  { label: "Security", path: "/app/settings/security", icon: ShieldCheck },
  { label: "Login Sessions", path: "/app/settings/sessions", icon: Lock },
  { label: "API Keys", path: "/app/settings/api", icon: KeyRound },
  { label: "Verification", path: "/app/verification", icon: BadgeCheck },
];

export const SettingsNav: React.FC = () => {
  return (
    <div className="card h-fit lg:sticky lg:top-20">
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive ? "bg-primary text-white" : "text-ink-900/60 hover:bg-surface-muted"
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
