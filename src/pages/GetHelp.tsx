import React from "react";
import { Mail, MapPin, Phone, HeadphonesIcon, ShieldCheck, Building2, Briefcase } from "lucide-react";

const departments = [
  {
    name: "Customer Support",
    icon: HeadphonesIcon,
    phone: "+234 700 111 2222",
    email: "support@vistapay.io",
    hours: "24/7",
  },
  {
    name: "Fraud & Security",
    icon: ShieldCheck,
    phone: "+234 700 333 4444",
    email: "security@vistapay.io",
    hours: "24/7",
  },
  {
    name: "Business & Partnerships",
    icon: Briefcase,
    phone: "+234 1 908 5566",
    email: "partnerships@vistapay.io",
    hours: "Mon–Fri, 9am–5pm WAT",
  },
  {
    name: "Corporate Office",
    icon: Building2,
    phone: "+234 1 908 5500",
    email: "info@vistapay.io",
    hours: "Mon–Fri, 9am–5pm WAT",
  },
];

export const GetHelp: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="card widget-primary">
        <h3 className="mb-1 font-bold text-ink-900">We're here to help</h3>
        <p className="text-sm text-ink-900/60">
          Reach the right VistaPay team below, or visit our headquarters in person.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {departments.map((d) => (
          <div key={d.name} className="card">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl widget-primary text-primary">
                <d.icon size={18} />
              </span>
              <div>
                <h4 className="font-bold text-ink-900">{d.name}</h4>
                <p className="text-xs text-ink-900/50">{d.hours}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <a href={`tel:${d.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-ink-900/80 hover:text-primary">
                <Phone size={14} /> {d.phone}
              </a>
              <a href={`mailto:${d.email}`} className="flex items-center gap-2.5 text-ink-900/80 hover:text-primary">
                <Mail size={14} /> {d.email}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-4 flex items-start gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl widget-primary text-primary">
            <MapPin size={18} />
          </span>
          <div>
            <h4 className="font-bold text-ink-900">VistaPay Headquarters</h4>
            <p className="text-sm text-ink-900/60">14B Adeola Odeku Street, Victoria Island, Lagos, Nigeria</p>
          </div>
        </div>

        {/* Sample map preview — static illustration standing in for an embedded map. */}
        <div className="relative h-64 w-full overflow-hidden rounded-xl border border-surface-border">
          <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="220" fill="#EAF1EF" />
            {[...Array(9)].map((_, i) => (
              <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="220" stroke="#D5E3DF" strokeWidth="1" />
            ))}
            {[...Array(6)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#D5E3DF" strokeWidth="1" />
            ))}
            <path d="M0 150 C 100 120, 180 170, 260 130 S 400 90, 400 90" stroke="#BFD6D0" strokeWidth="14" fill="none" />
            <path d="M60 0 C 90 60, 70 120, 120 220" stroke="#BFD6D0" strokeWidth="10" fill="none" />
            <circle cx="220" cy="100" r="9" fill="#0E3B39" />
            <circle cx="220" cy="100" r="16" fill="#0E3B39" fillOpacity="0.15" />
            <path d="M220 100 L220 70 C220 58, 236 58, 236 70 C236 82, 220 100, 220 100 Z" fill="#0E3B39" />
          </svg>
          <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-full rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-card">
            VistaPay HQ
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-medium text-ink-900/50 shadow-sm">
            Sample map preview
          </div>
        </div>
      </div>
    </div>
  );
};
