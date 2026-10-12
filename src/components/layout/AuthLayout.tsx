import React, { useEffect, useRef, useState } from "react";
import { Wallet, Send, ShieldCheck, TrendingUp } from "lucide-react";

interface Slide {
  icon: typeof Send;
  title: string;
  body: string;
  preview: React.ReactNode;
}

interface AuthLayoutProps {
  children: React.ReactNode;
}

const slides: Slide[] = [
   
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    body: "Every transaction is protected with PIN verification, 2FA, and real-time fraud monitoring — your money stays yours.",
    preview: (
      <>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Transaction PIN</span>
          <ShieldCheck size={16} className="text-secondary" />
        </div>
        <div className="mb-4 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full bg-secondary" />
          ))}
        </div>
        <p className="text-center text-[11px] text-white/50">Verified in 0.8s</p>
      </>
    ),
  },
  {
    icon: TrendingUp,
    title: "Grow Your Balance",
    body: "Track spending, watch trends, and hit your savings goals with beautiful, real-time analytics built right in.",
    preview: (
      <>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">This Month</span>
          <span className="text-xs font-semibold text-secondary">+12.4%</span>
        </div>
        <div className="flex h-16 items-end gap-1.5">
          {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
            <span key={i} className="flex-1 rounded-sm bg-white/20" style={{ height: `${h}%` }} />
          ))}
        </div>
      </>
    ),
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [active, setActive] = useState(0);
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i: number) => setActive((i + slides.length) % slides.length);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      goTo(active + (delta < 0 ? 1 : -1));
    }
    dragStartX.current = null;
  };

  const slide = slides[active];

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-secondary">
              <Wallet size={18} />
            </span>
            <span className="text-lg font-extrabold text-ink-900">MetroPay V2</span>
          </div>
          {children}
          <div className="mt-10 flex items-center justify-between text-xs text-ink-900/40">
            <span>Privacy Policy</span>
            <span>Copyright 2026</span>
          </div>
        </div>
      </div>

      <div
        className="relative hidden touch-pan-y select-none overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-center lg:px-16"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative mb-10 rounded-2xl bg-primary-dark/80 p-5 shadow-2xl backdrop-blur transition-all duration-300">
          {slide.preview}
        </div>

        <h2 className="relative text-3xl font-extrabold leading-tight text-white transition-all duration-300">{slide.title}</h2>
        <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-white/60 transition-all duration-300">{slide.body}</p>

        <div className="relative mt-8 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-secondary" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
