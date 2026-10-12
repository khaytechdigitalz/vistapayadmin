import React, { useEffect, useRef, useState } from "react";
import { Moon, Palette, Sun, Check } from "lucide-react";
import { colorPresets, useTheme } from "@/context/ThemeContext";

export const ThemeSwitcher: React.FC = () => {
  const { mode, toggleMode, preset, setPreset } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl border border-surface-border p-2.5 text-ink-900 hover:bg-surface-muted transition"
        title="Appearance"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-full mt-2 w-[88vw] max-w-xs sm:w-80 rounded-2xl border border-surface-border bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Mode Toggle */}
          <div className="mb-4 flex items-center justify-between border-b border-surface-border pb-3">
            <p className="text-sm font-bold text-ink-900">Appearance</p>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 rounded-xl bg-surface-muted px-2.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-surface-muted/80 transition shrink-0"
            >
              {mode === "light" ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} className="text-primary" />}
              <span>{mode === "light" ? "Light" : "Dark"}</span>
            </button>
          </div>

          <p className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">Brand colors</p>
          
          {/* 2-Column Responsive Preset Grid */}
          <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {colorPresets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`flex items-center gap-2.5 rounded-xl p-2.5 border transition text-left min-w-0 ${
                  preset.id === p.id 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-surface-border hover:bg-surface-muted"
                }`}
              >
                <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-surface-border shadow-sm">
                  <span className="h-full w-1/2" style={{ backgroundColor: p.primary }} />
                  <span className="h-full w-1/2" style={{ backgroundColor: p.secondary }} />
                  {preset.id === p.id && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Check size={11} className="text-white" />
                    </span>
                  )}
                </span>
                <span className="text-xs font-semibold leading-tight text-ink-900 truncate min-w-0 flex-1">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};